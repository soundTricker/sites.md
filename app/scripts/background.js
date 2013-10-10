(function() {
  chrome.runtime.onInstalled.addListener(function(details) {
    return console.log('previousVersion', details.previousVersion);
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(tab.url);
    if (!tab.url) {
      return;
    }
    if (tab.url.indexOf("sites.google.com") > -1) {
      return chrome.pageAction.show(tabId);
    }
  });

  chrome.contextMenus.create({
    type: "checkbox",
    id: "markdownized",
    title: "Markdownized",
    contexts: ["all"],
    onclick: function(info, tab) {
      return chrome.tabs.sendMessage(tab.id, {
        cmd: "toggle"
      }, function(response) {
        return console.log(response);
      });
    },
    documentUrlPatterns: ["http://sites.google.com/*", "https://sites.google.com/*"]
  }, function() {
    return console.log("hoge");
  });

  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.cmd !== 'updateValue') {
      return;
    }
    return chrome.contextMenus.update("markdownized", {
      checked: request.marked
    });
  });

}).call(this);
