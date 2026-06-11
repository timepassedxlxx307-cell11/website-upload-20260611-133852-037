(function() {
  function attachStream(video, streamUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    }
  }

  window.setupPlayer = function(streamUrl) {
    var video = document.getElementById('movieVideo');
    var startButton = document.getElementById('playerStart');
    var shell = document.getElementById('playerShell');
    var ready = false;

    if (!video || !startButton || !shell || !streamUrl) {
      return;
    }

    function beginPlayback() {
      if (!ready) {
        attachStream(video, streamUrl);
        ready = true;
      }

      startButton.classList.add('is-hidden');
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function() {
          startButton.classList.remove('is-hidden');
        });
      }
    }

    startButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlayback();
    });

    shell.addEventListener('click', function(event) {
      if (event.target === shell) {
        beginPlayback();
      }
    });
  };
})();
