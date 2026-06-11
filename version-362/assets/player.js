(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-overlay");
    var src = video ? video.getAttribute("data-stream") : "";
    var loaded = false;
    var hls = null;

    function load() {
      if (!video || !src || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      load();
      box.classList.add("is-started");
      video.play().catch(function () {
        var once = function () {
          video.play().catch(function () {});
          video.removeEventListener("canplay", once);
          video.removeEventListener("loadedmetadata", once);
        };
        video.addEventListener("canplay", once);
        video.addEventListener("loadedmetadata", once);
      });
    }

    if (button && video) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
