(function() {
  var toggle;

  marked.setOptions({
    gfm: true,
    highlight: function(code, lang) {
      if (!lang || !hljs) {
        return code;
      }
      return hljs.highlight(lang, code).value;
    },
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
  });

  toggle = function() {
    return $('.sites-layout-tile').each(function() {
      var $dummy, $editable, $marked, $that, $toc, k, map, result, tocs, v;
      $that = $(this);
      $editable = $that.find('.editable');
      if ($editable.length > 0) {
        $that = $editable;
      }
      if ($that.hasClass('marked')) {
        $that.html($that.data("origin")).removeClass('marked');
      } else {
        if ($that.hasClass('editable')) {
          $that.data('origin', $that.html());
        }
        result = marked($that[0].innerText);
        map = {};
        $marked = $("<div>" + result + "</div>");
        $marked.find("h1,h2,h3,h4").each(function(i) {
          var level;
          $(this).before($("<a>", {
            id: "md-header-" + i
          }));
          level = this.tagName.replace(/h(\d+)/, "$1");
          return map["md-header-" + i] = {
            level: level,
            title: $(this).text()
          };
        });
        if (result.indexOf("[TOC]" >= 0)) {
          $dummy = $("<div>");
          $toc = $("<ol>").appendTo($dummy);
          tocs = ((function() {
            var _results;
            _results = [];
            for (k in map) {
              v = map[k];
              _results.push("<li><a href=\"#" + k + "\" class=\"level-" + v.level + "\">" + v.title + "</a></li>");
            }
            return _results;
          })()).join("");
          $toc.append($(tocs));
          result = $marked.html().replace("[TOC]", "[TOC]<br/>" + $dummy.html());
        }
        $that.html(result).addClass('marked');
      }
      return chrome.runtime.sendMessage({
        "marked": $that.hasClass("marked"),
        cmd: "updateValue"
      });
    });
  };

  shortcut.add("Meta+Shift+P", toggle);

  shortcut.add("Ctrl+Shift+P", toggle);

  $('.sites-layout-tile').each(function() {
    var $that;
    $that = $(this);
    return $that.data('origin', $that.html());
  });

  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.cmd !== 'toggle') {
      return;
    }
    return toggle();
  });

  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.cmd !== 'isMarked') {
      return;
    }
    return callback({
      marked: $('.sites-layout-tile.marked').length || $('.sites-layout-tile .editable.marked').length
    });
  });

}).call(this);
