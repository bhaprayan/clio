let reccsButton = document.getElementById("reccsButton");

reccsButton.onclick = function(element) {
  pullReccs("reccs_div", 10);
};

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function pullReccs(divName, numTopics) {
  var div = document.getElementById(divName);
  var ul = document.createElement("ul");
  ul.id = "reccs_list";
  div.appendChild(ul);
  chrome.storage.sync.get("topics", function(data) {
    if (data.topics && data.topics.length) {
      topics_array = data.topics.split(",");
      shuffle(topics_array);
      getBooksInfo(topics_array, numTopics);
    }
  });
}

async function getBooksInfo(topicNames, numTopics) {
  chrome.storage.sync.get("apikey", function(data) {
    let apikey = data.apikey;
    let url = "https://www.googleapis.com/books/v1/volumes?q=";
    for (var i = 0, ie = numTopics; i < ie; i++) {
      let topic = topicNames[i];
      let requesturl = url + topic + "&key=" + apikey;
      console.log(requesturl);
      httpGetAsync(requesturl, populateReccs);
    }
  });
}

async function httpGetAsync(theUrl, callback) {
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback("reccs_div", xmlHttp.response, xmlHttp.responseType);
    }
  };
  xmlHttp.open("GET", proxyurl + theUrl, true); // true for asynchronous
  xmlHttp.responseType = "json";
  xmlHttp.send(null);
}

function populateReccs(divName, response, responseType) {
  if (responseType == "json") {
    if (response["items"] && response["items"].length) {
      let book = response["items"][0];
      let title = book["volumeInfo"]["title"];
      let link = book["selfLink"];
      let author = "";
      if (book["authors"] && book["authors"].length) {
        author = book["authors"][0];
      }
      var ul = document.getElementById("reccs_list");
      var a = document.createElement("a");
      a.href = link;
      a.appendChild(document.createTextNode(title));
      //a.addEventListener("click", onAnchorClick);
      var li = document.createElement("li");
      li.appendChild(a);
      ul.appendChild(li);
    }
  }
}

//"items": [
//{
//"kind": "books#volume",
//"id": "_ojXNuzgHRcC",
//"etag": "OTD2tB19qn4",
//"selfLink": "https://www.googleapis.com/books/v1/volumes/_ojXNuzgHRcC",
//"volumeInfo": {
//"title": "Flowers",
//"authors": [
//"Vijaya Khisty Bodach"
//],
//...
//},
