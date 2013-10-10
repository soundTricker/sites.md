$toggle = $("#toggle").on "click", ()->
  chrome.tabs.query {active: on, currentWindow: on}, (tabs)->
    chrome.tabs.sendMessage tabs[0].id, cmd: "toggle", (response)->
      console.log response

chrome.tabs.query {active: on, currentWindow: on}, (tabs)->
  chrome.tabs.sendMessage tabs[0].id, cmd: "isMarked", (response)->
    $toggle.prop "checked", response.marked
