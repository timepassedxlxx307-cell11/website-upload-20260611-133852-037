(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function setText(node, value) {
        if (node) {
            node.textContent = value;
        }
    }

    window.initMoviePlayer = function (source) {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        var playButton = document.querySelector('[data-player-play]');
        var playToggle = document.querySelector('[data-player-toggle]');
        var muteToggle = document.querySelector('[data-player-mute]');
        var fullToggle = document.querySelector('[data-player-full]');
        var ready = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource(done) {
            if (ready) {
                done();
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                done();
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        done();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    });
                } else {
                    video.src = source;
                    done();
                }
            });
        }

        function startPlay() {
            attachSource(function () {
                if (cover) {
                    cover.classList.add('hidden');
                }
                if (shell) {
                    shell.classList.add('active');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            });
        }

        function togglePlay() {
            if (video.paused) {
                startPlay();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlay);
        }
        if (playButton) {
            playButton.addEventListener('click', startPlay);
        }
        if (playToggle) {
            playToggle.addEventListener('click', togglePlay);
        }
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', function () {
            setText(playToggle, '暂停');
            if (cover) {
                cover.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            setText(playToggle, '播放');
        });
        if (muteToggle) {
            muteToggle.addEventListener('click', function () {
                video.muted = !video.muted;
                setText(muteToggle, video.muted ? '声音' : '静音');
            });
        }
        if (fullToggle) {
            fullToggle.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell && shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
