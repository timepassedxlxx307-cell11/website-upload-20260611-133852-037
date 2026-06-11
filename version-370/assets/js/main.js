(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".nav-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupHorizontalRows() {
        document.querySelectorAll("[data-scroll-row]").forEach(function (row) {
            var section = row.closest(".content-section");
            if (!section) {
                return;
            }
            var left = section.querySelector("[data-scroll-left]");
            var right = section.querySelector("[data-scroll-right]");
            var amount = 340;
            if (left) {
                left.addEventListener("click", function () {
                    row.scrollBy({ left: -amount, behavior: "smooth" });
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    row.scrollBy({ left: amount, behavior: "smooth" });
                });
            }
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        document.querySelectorAll(".page-main, .detail-main, body").forEach(function (scope) {
            var input = scope.querySelector(".filter-input");
            var select = scope.querySelector(".channel-filter");
            var list = scope.querySelector(".searchable-list");
            if (!list || (!input && !select)) {
                return;
            }
            var items = Array.prototype.slice.call(list.querySelectorAll(".search-item"));
            function apply() {
                var query = normalize(input ? input.value : "");
                var channel = select ? select.value : "";
                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute("data-search"));
                    var itemChannel = item.getAttribute("data-channel") || "";
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchChannel = !channel || itemChannel === channel;
                    item.classList.toggle("is-hidden-card", !(matchText && matchChannel));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupImageFallback() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupHorizontalRows();
        setupFilters();
        setupImageFallback();
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.querySelector("[data-player-overlay]");
        var hls = null;
        var prepared = false;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
