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
      var $dummy, $editable, $marked, $that, $toc, $tocContainter, $tocWrap, list, result, tree;
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
        list = [];
        $marked = $("<div>" + result + "</div>");
        $marked.find("h1,h2,h3,h4").each(function(i) {
          var level;
          $(this).before($("<a>", {
            id: "md-header-" + i
          }));
          level = this.tagName.replace(/h(\d+)/i, "$1");
          console.log(level);
          return list.push({
            level: parseInt(level),
            title: $(this).text(),
            id: "md-header-" + i
          });
        });
        if (result.indexOf("[TOC]" >= 0)) {
          $dummy = $("<div>");
          $tocWrap = $('<div class="site-md-toc goog-toc"><a href="javascript:" class="site-md-toc-toggle">[TOC]</a></div>').appendTo($dummy);
          $tocContainter = $('<div class="site-md-toc-container">').appendTo($tocWrap);
          $toc = $("<ol>").appendTo($tocContainter);
          tree = function($root, $before, beforeLevel, deeps, list, levelMap) {
            var $li, $ol, c, currentDeeps, v, _ref, _ref1, _ref2;
            v = list.shift();
            if (!v) {
              return;
            }
            $li = $("<li><a href=\"#" + v.id + "\" class=\"level-" + v.level + "\">" + v.title + "</a></li>");
            currentDeeps = deeps;
            if (v.level > beforeLevel || !$before) {
              if (!$before) {
                $root.append($li);
                levelMap[v.level] = {
                  $ol: $root,
                  deeps: currentDeeps + 1
                };
              } else {
                $ol = $("<ol>").append($li).appendTo($before);
                levelMap[v.level] = {
                  $ol: $ol,
                  deeps: currentDeeps + 1
                };
              }
              currentDeeps++;
            } else if (v.level === beforeLevel) {
              $before.parent().append($li);
            } else {
              $ol = (_ref = levelMap[v.level]) != null ? _ref.$ol : void 0;
              deeps = (_ref1 = levelMap[v.level]) != null ? _ref1.deeps : void 0;
              c = v.level;
              while (!$ol && c > 0) {
                _ref2 = levelMap[c--] != null, $ol = _ref2.$ol, deeps = _ref2.deeps;
              }
              if (!$ol) {
                $ol = $root;
              }
              $ol.append($li);
              currentDeeps = 1;
            }
            return tree($root, $li, v.level, currentDeeps, list, levelMap);
          };
          tree($toc, null, 0, 0, list, {});
          result = $marked.html().replace("[TOC]", $dummy.html());
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
