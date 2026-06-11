(function () {
    var currentFilters = new WeakMap();

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function toggleMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function hideBrokenImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("image-hidden");
                img.removeAttribute("src");
            }, { once: true });
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                startTimer();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                setSlide(dotIndex);
                startTimer();
            });
        });
        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        setSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll(".filter-buttons button"));
            var list = panel.nextElementSibling ? panel.nextElementSibling.querySelector("[data-filter-list]") : document.querySelector("[data-filter-list]");
            if (!list) {
                list = document.querySelector("[data-filter-list]");
            }
            if (!list) {
                return;
            }
            currentFilters.set(panel, {});

            function applyFilter() {
                var state = currentFilters.get(panel) || {};
                var query = normalize(input ? input.value : "");
                Array.prototype.slice.call(list.children).forEach(function (item) {
                    var content = normalize([
                        item.dataset.title,
                        item.dataset.region,
                        item.dataset.type,
                        item.dataset.year,
                        item.dataset.tags,
                        item.textContent
                    ].join(" "));
                    var typeOk = !state.type || normalize(item.dataset.type).indexOf(normalize(state.type)) !== -1;
                    var regionOk = !state.region || normalize(item.dataset.region).indexOf(normalize(state.region)) !== -1;
                    var categoryOk = !state.category || content.indexOf(normalize(state.category)) !== -1;
                    var yearOk = !state.yearMin || Number(item.dataset.year || 0) >= Number(state.yearMin);
                    var queryOk = !query || content.indexOf(query) !== -1;
                    item.classList.toggle("is-hidden", !(typeOk && regionOk && categoryOk && yearOk && queryOk));
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
                var params = new URLSearchParams(window.location.search);
                if (params.get("q")) {
                    input.value = params.get("q");
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (btn) {
                        btn.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    if (button.hasAttribute("data-filter-reset")) {
                        currentFilters.set(panel, {});
                        if (input) {
                            input.value = "";
                        }
                    } else {
                        currentFilters.set(panel, {
                            type: button.dataset.type || "",
                            region: button.dataset.region || "",
                            category: button.dataset.category || "",
                            yearMin: button.dataset.yearMin || ""
                        });
                    }
                    applyFilter();
                });
            });
            applyFilter();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-video-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-button]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var started = false;
            var hls = null;

            function attachStream() {
                if (started || !stream) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                attachStream();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("click", function () {
                if (!started) {
                    playVideo();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        toggleMenu();
        hideBrokenImages();
        initHero();
        initFilters();
        initPlayers();
    });
})();
