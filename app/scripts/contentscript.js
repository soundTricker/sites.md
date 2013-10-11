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
      var $dummy, $editable, $marked, $that, $toc, list, result, tree;
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
          $toc = $("<ol>").appendTo($dummy);
          tree = function($root, $before, beforeLevel, deeps, list, levelMap) {
            var $li, $ol, c, currentDeeps, v, _ref, _ref1;
            v = list.shift();
            console.log(v, $before, beforeLevel, deeps, list);
            if (!v) {
              return;
            }
            $li = $("<li><a href=\"#" + v.id + "\" class=\"level-" + v.level + "\">" + v.title + "</a></li>");
            currentDeeps = deeps;
            if (v.level > beforeLevel || !$before) {
              if (v.level === 1) {
                $root.append($li);
                levelMap[1] = {
                  ol: $root,
                  deeps: currentDeeps + 1
                };
              } else {
                $ol = $("<ol>").append($li).appendTo($before);
                levelMap[v.level] = {
                  ol: $ol,
                  deeps: currentDeeps + 1
                };
              }
              currentDeeps++;
            } else if (v.level === beforeLevel) {
              $before.parent().append($li);
            } else {
              _ref = levelMap[v.level] != null, $ol = _ref.$ol, currentDeeps = _ref.currentDeeps;
              c = v.level;
              while (!$ol) {
                _ref1 = levelMap[c--] != null, $ol = _ref1.$ol, currentDeeps = _ref1.currentDeeps;
              }
              $ol.append($li);
            }
            return tree($root, $li, v.level, currentDeeps, list, levelMap);
          };
          tree($toc, null, 0, 0, list, {});
          console.log($toc);
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
