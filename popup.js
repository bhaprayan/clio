// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.

var nlp = require("compromise");

let retrieveTopics = document.getElementById("retrieveTopics");
let clearTopics = document.getElementById("clearTopics");
let recommendBooks = document.getElementById("recommendBooks");

//chrome.storage.sync.get("color", function(data) {
//changeColor.style.backgroundColor = data.color;
//changeColor.setAttribute("value", data.color);
//});

//chrome.storage.sync.get("topics", function(data) {
//topics_array = data.topics.split(",");
//}

retrieveTopics.onclick = function(element) {
  buildTypedUrlList("typedUrl_div");
};

clearTopics.onclick = function(element) {
  clearTypedUrlList("typedUrl_div");
};

function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

async function clearTypedUrlList(divName) {
  var popupDiv = document.getElementById(divName);
  // clear display list
  popupDiv.innerHTML = "";
  // clear stored topic list
  chrome.storage.sync.set({ topics: [] }, function() {
    return;
  });
}

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.

async function pullTopics(divName, data) {
  for (var i = 0, ie = data.length; i < ie; ++i) {
    httpGetAsync(data[i], logRequest);
  }
}

function buildPopupDom(divName, data) {
  var popupDiv = document.getElementById(divName);
  var ul = document.createElement("ul");
  popupDiv.appendChild(ul);
  chrome.storage.sync.get("topics", function(data) {
    topics_array = data.topics.split(",");
    console.log(topics_array);
    for (var i = 0, ie = topics_array.length; i < ie; ++i) {
      var a = document.createElement("a");
      a.appendChild(document.createTextNode(topics_array[i]));
      //a.addEventListener("click", onAnchorClick);
      var li = document.createElement("li");
      li.appendChild(a);
      ul.appendChild(li);
    }
  });
}

async function httpGetAsync(theUrl, callback) {
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.response, xmlHttp.responseType);
  };
  xmlHttp.open("GET", proxyurl + theUrl, true); // true for asynchronous
  xmlHttp.responseType = "document";
  xmlHttp.send(null);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function logRequest(response, responseType) {
  doc = nlp(response.body.innerText);
  doc_topic = doc
    .topics()
    .out("clean")
    .replace(/[^\w\s]/gi, "") // remove special chars
    .replace(/(\r\n|\n|\r)/gm, "") // remove newlines
    .split(/[ ]+/) // remove whitespaces
    .filter(Boolean) // filter nulls
    .filter(onlyUnique); // extract unique
  chrome.storage.sync.get("topics", function(data) {
    //console.log("old topics are" + data.topics);
    new_topics = data.topics + doc_topic;
    chrome.storage.sync.set({ topics: new_topics }, function() {
      //console.log("new topics are:" + new_topics);
      console.log(new_topics);
    });
  });
}
// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList(divName) {
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var oneWeekAgo = new Date().getTime() - microsecondsPerWeek;
  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;
  chrome.history.search(
    {
      text: "", // Return every history item....
      startTime: oneWeekAgo // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var processVisitsWithUrl = function(url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          return function(visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({ url: url }, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    }
  );
  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  var urlToCount = {};
  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function(url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      // Ignore items unless the user typed the URL.
      if (visitItems[i].transition != "typed") {
        continue;
      }
      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }
      urlToCount[url]++;
    }
    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };
  // This function is called when we have the final list of URls to display.
  var onAllVisitsProcessed = function() {
    // Get the top scorring urls.
    urlArray = [];
    for (var url in urlToCount) {
      urlArray.push(url);
    }
    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function(a, b) {
      return urlToCount[b] - urlToCount[a];
    });
    let data = urlArray.slice(0, 10);
    pullTopics(divName, data).then(buildPopupDom("typedUrl_div", data));
  };
}

//document.addEventListener("DOMContentLoaded", function() {
//buildTypedUrlList("typedUrl_div");
//});
