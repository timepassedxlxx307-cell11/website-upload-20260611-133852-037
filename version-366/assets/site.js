const ready = (fn) => {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
};

ready(() => {
    const toggle = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.classList.toggle("open", !expanded);
        });
    }

    document.querySelectorAll(".site-search").forEach((form) => {
        form.addEventListener("submit", (event) => {
            const input = form.querySelector("input[name='q']");
            if (!input) {
                return;
            }
            const value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = "search.html";
            }
        });
    });

    document.querySelectorAll("[data-hero]").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const prev = hero.querySelector("[data-prev]");
        const next = hero.querySelector("[data-next]");
        let index = 0;
        let timer = null;

        const show = (nextIndex) => {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
            dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
            }
        };

        prev?.addEventListener("click", () => {
            show(index - 1);
            start();
        });

        next?.addEventListener("click", () => {
            show(index + 1);
            start();
        });

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                show(i);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const mainSearchInput = document.querySelector(".main-search-input");
    if (mainSearchInput && query) {
        mainSearchInput.value = query;
    }

    document.querySelectorAll(".filter-scope").forEach((scope) => {
        const bar = scope.parentElement?.querySelector(".filter-bar");
        const input = bar?.querySelector(".filter-input");
        const selects = Array.from(bar?.querySelectorAll(".filter-select") || []);
        const items = Array.from(scope.querySelectorAll(".movie-card, .ranking-row, .compact-card"));

        const apply = () => {
            const keyword = (input?.value || "").trim().toLowerCase();
            const typeValue = selects.find((select) => select.dataset.filter === "type")?.value || "";
            const yearValue = selects.find((select) => select.dataset.filter === "year")?.value || "";

            items.forEach((item) => {
                const text = (item.dataset.search || item.textContent || "").toLowerCase();
                const typeText = (item.dataset.type || "").toLowerCase();
                const year = parseInt(item.dataset.year || "0", 10);
                const matchKeyword = !keyword || text.includes(keyword);
                const matchType = !typeValue || typeText.includes(typeValue.toLowerCase()) || text.includes(typeValue.toLowerCase());
                const matchYear = !yearValue || (yearValue === "older" ? year < 2023 : year === parseInt(yearValue, 10));
                item.classList.toggle("is-hidden", !(matchKeyword && matchType && matchYear));
            });
        };

        input?.addEventListener("input", apply);
        selects.forEach((select) => select.addEventListener("change", apply));
        apply();
    });

    document.querySelectorAll(".video-player").forEach((box) => {
        const video = box.querySelector("video");
        const mask = box.querySelector(".player-mask");
        const url = box.dataset.video;
        let hlsInstance = null;
        let attached = false;

        const attach = async () => {
            if (!video || !url || attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                const mod = await import("./hls-vendor-dru42stk.js");
                const Hls = mod.H;
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    throw new Error("video unsupported");
                }
            }
            attached = true;
        };

        const play = async () => {
            try {
                await attach();
                box.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                await video.play();
            } catch (error) {
                box.classList.remove("is-playing");
                if (mask) {
                    mask.innerHTML = "<span class=\"play-circle\">▶</span><strong>视频暂时无法加载</strong>";
                }
            }
        };

        mask?.addEventListener("click", play);
        video?.addEventListener("click", () => {
            if (!attached) {
                play();
                return;
            }
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
});
