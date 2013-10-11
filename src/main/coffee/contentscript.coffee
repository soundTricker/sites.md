
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
        console.log level
        list.push
          level : parseInt(level)
          title : $(@).text()
          id : "md-header-#{i}"

      if result.indexOf "[TOC]" >= 0
        $dummy = $ "<div>"
        $toc = $("<ol>").appendTo $dummy

        tree = ($root, $before, beforeLevel, deeps, list, levelMap)->
          v = list.shift()
          console.log v, $before, beforeLevel, deeps, list
          return if !v
          $li = $("<li><a href=\"##{v.id}\" class=\"level-#{v.level}\">#{v.title}</a></li>")
          currentDeeps = deeps
          if v.level > beforeLevel or !$before
            if v.level is 1
              $root.append $li
              levelMap[1] = ol : $root, deeps : currentDeeps + 1
            else
              $ol = $("<ol>").append($li).appendTo $before
              levelMap[v.level] = ol : $ol, deeps : currentDeeps + 1
            currentDeeps++
          else if v.level is beforeLevel
            $before.parent().append $li
          else
            {$ol, currentDeeps} = levelMap[v.level]?
            c = v.level
            while !$ol
              {$ol, currentDeeps} = levelMap[c--]?
            $ol.append $li
          tree $root, $li, v.level, currentDeeps, list, levelMap

        tree $toc, null, 0, 0, list, {}
        console.log $toc
        result = $marked.html().replace "[TOC]", "[TOC]<br/>" + $dummy.html()

      $that.html(result).addClass 'marked'

    chrome.runtime.sendMessage {"marked" : $that.hasClass("marked") , cmd : "updateValue"}

shortcut.add "Meta+Shift+P", toggle
shortcut.add "Ctrl+Shift+P", toggle


$('.sites-layout-tile').each ()-> 
  $that = $ @
  $that.data 'origin' , $that.html()


chrome.runtime.onMessage.addListener (request, sender , callback)->
  return if request.cmd isnt 'toggle'
  toggle()

chrome.runtime.onMessage.addListener (request, sender , callback)->
  return if request.cmd isnt 'isMarked'
  callback marked : $('.sites-layout-tile.marked').length || $('.sites-layout-tile .editable.marked').length
