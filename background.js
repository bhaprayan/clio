// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ topics: [] }, function() {
    console.log("Set topics to empty list");
  });
  chrome.storage.sync.set(
    { apikey: "AIzaSyD64JeeHOr9JOd7f_Z8605kbMUXTwRviTY" },
    function() {
      console.log("Set the API key");
    }
  );
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    console.log(tab.title);
  });
});
