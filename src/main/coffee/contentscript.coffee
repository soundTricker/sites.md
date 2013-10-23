settings = null

$('.sites-layout-tile').each ()->
  $that = $ @
  $that.data 'origin' , $that.html()

chrome.runtime.sendMessage {cmd : "get" , name : "settings"} , (result)->
  settings = result
  console.log arguments
  return if !settings || !Array.isArray settings

  check = (setting)->
    return true if setting.type is "url" and location.href.indexOf setting.expressionText >= 0
    return true if setting.expressionType is "title" && $("#sites-page-title-header").text().indexOf setting.expressionText
    return $(".sites-layout-tile:contains('#{setting.expressionText}')").length > 0

  return if settings
  .filter((setting)->setting.auto is "off")
  .some check

  return toggle() if settings.filter((setting)->setting.auto is "on").some check

marked.setOptions
  gfm: true
  highlight: (code, lang)->
    return code if !lang || !hljs
    return hljs.highlight(lang, code).value
  tables: true
  breaks: true
  pedantic: false
  sanitize: true
  smartLists: true
  smartypants: false
  langPrefix: 'lang-'

toggle = ()->
  $('.sites-layout-tile').each ()->
    $that = $ @

    $editable = $that.find '.editable'

    if $editable.length > 0
      $that = $editable

    if $that.hasClass 'marked'
        $that.html($that.data("origin")).removeClass 'marked'
    else
      if $that.hasClass 'editable'
        $that.data 'origin' , $that.html()
      result = marked $that[0].innerText
      list = []
      $marked = $("<div>" + result + "</div>")
      $marked.find("h1,h2,h3,h4").each (i)->
        $(@).before $("<a>" , id : "md-header-#{i}")
        level = @.tagName.replace /h(\d+)/i , "$1"
        list.push
          level : parseInt(level)
          title : $(@).text()
          id : "md-header-#{i}"

      if result.indexOf "[TOC]" >= 0
        $dummy = $ "<div>"
        $tocWrap = $('<div class="site-md-toc goog-toc"><a href="javascript:" class="site-md-toc-toggle">[TOC]</a></div>').appendTo $dummy
        $tocContainter = $('<div class="site-md-toc-container">').appendTo $tocWrap
        $toc = $("<ol>").appendTo $tocContainter

        tree = ($root, $before, beforeLevel, deeps, list, levelMap)->
          v = list.shift()
          return if !v
          $li = $("<li><a href=\"##{v.id}\" class=\"level-#{v.level}\">#{v.title}</a></li>")
          currentDeeps = deeps
          if v.level > beforeLevel or !$before
            if !$before
              $root.append $li
              levelMap[v.level] = {$ol : $root, deeps : currentDeeps + 1}
            else
              $ol = $("<ol>").append($li).appendTo $before
              levelMap[v.level] = {$ol : $ol, deeps : currentDeeps + 1}
            currentDeeps++
          else if v.level is beforeLevel
            $before.parent().append $li
          else
            $ol = levelMap[v.level]?.$ol
            deeps = levelMap[v.level]?.deeps
            c = v.level
            while !$ol and c > 0
              {$ol, deeps} = levelMap[c--]?
            $ol = $root if !$ol
            $ol.append $li
            currentDeeps = 1
          tree $root, $li, v.level, currentDeeps, list, levelMap

        tree $toc, null, 0, 0, list, {}
        result = $marked.html().replace "[TOC]", $dummy.html()

      $that.html(result).addClass 'marked'

    chrome.runtime.sendMessage {"marked" : $that.hasClass("marked") , cmd : "updateValue"}

shortcut.add "Meta+Shift+P", toggle
shortcut.add "Ctrl+Shift+P", toggle



chrome.runtime.onMessage.addListener (request, sender , callback)->
  return if request.cmd isnt 'toggle'
  toggle()

chrome.runtime.onMessage.addListener (request, sender , callback)->
  return if request.cmd isnt 'isMarked'
  callback marked : $('.sites-layout-tile.marked').length || $('.sites-layout-tile .editable.marked').length
