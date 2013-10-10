(function() {
  var $toggle;

  $toggle = $("#toggle").on("click", function() {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      return chrome.tabs.sendMessage(tabs[0].id, {
        cmd: "toggle"
      }, function(response) {
        return console.log(response);
      });
    });
  });

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    return chrome.tabs.sendMessage(tabs[0].id, {
      cmd: "isMarked"
    }, function(response) {
      return $toggle.prop("checked", response.marked);
    });
  });

}).call(this);
