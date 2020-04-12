let reccsButton = document.getElementById("reccsButton");

reccsButton.onclick = function(element) {
  populateReccs("reccs_div", 10);
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

function populateReccs(divName, numTopics) {
  var div = document.getElementById(divName);
  var ul = document.createElement("ul");
  div.appendChild(ul);
  chrome.storage.sync.get("topics", function(data) {
    if (data.topics && data.topics.length) {
      topics_array = data.topics.split(",");
      shuffle(topics_array);
      for (var i = 0, ie = numTopics; i < ie; ++i) {
        var a = document.createElement("a");
        a.appendChild(document.createTextNode(topics_array[i]));
        //a.addEventListener("click", onAnchorClick);
        var li = document.createElement("li");
        li.appendChild(a);
        ul.appendChild(li);
      }
    }
  });
}
