chrome.runtime.onInstalled.addListener (details) ->
  console.log 'previousVersion', details.previousVersion


chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab)->
  console.log tab.url
  return if !tab.url
  chrome.pageAction.show tabId if tab.url.indexOf("sites.google.com") > -1

chrome.contextMenus.create
  type : "checkbox"
  id : "markdownized"
  title : "Markdownized"
  contexts : [
    "all"
  ]
  onclick : (info, tab)->
    chrome.tabs.sendMessage tab.id, cmd: "toggle", (response)-> console.log response
  documentUrlPatterns : [
    "http://sites.google.com/*",
    "https://sites.google.com/*"
  ]
  ,()-> console.log "hoge"

chrome.runtime.onMessage.addListener (request, sender , callback)->
  return if request.cmd isnt 'updateValue'
  chrome.contextMenus.update "markdownized",
    checked : request.marked

