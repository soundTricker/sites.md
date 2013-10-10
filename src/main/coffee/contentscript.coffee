
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
      map = {}
      $marked = $("<div>" + result + "</div>")
      $marked.find("h1,h2,h3,h4").each (i)->
        $(@).before $("<a>" , id : "md-header-#{i}")
        level = @.tagName.replace /h(\d+)/ , "$1"
        map["md-header-#{i}"] = level : level, title : $(@).text()

      if result.indexOf "[TOC]" >= 0
        $dummy = $ "<div>"
        $toc = $("<ol>").appendTo $dummy

        tocs = ("<li><a href=\"##{k}\" class=\"level-#{v.level}\">#{v.title}</a></li>" for k, v of map).join ""
        $toc.append $ tocs
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
