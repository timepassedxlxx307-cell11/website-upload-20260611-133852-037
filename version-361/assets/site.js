(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileNavigation();
    setupImageFallbacks();
    setupHeroSlider();
    setupSearchFilter();
    setupHlsPlayer();
  });

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('img');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.poster-shell, .hero-slide, .related-thumb, .hero-thumb');
        if (holder) {
          holder.classList.add('image-missing');
        }
        image.remove();
      }, { once: true });
    });
  }

  function setupHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('mouseenter', function () {
        activate(index);
        stop();
      });
      thumb.addEventListener('mouseleave', start);
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupSearchFilter() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var count = document.querySelector('[data-search-count]');

    if (!input || cards.length === 0) {
      return;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
    }

    var cached = cards.map(function (card) {
      return {
        element: card,
        text: cardText(card)
      };
    });

    function apply() {
      var keyword = normalize(input.value);
      var visible = 0;

      cached.forEach(function (item) {
        var matched = keyword === '' || item.text.indexOf(keyword) !== -1;
        item.element.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = keyword ? '匹配到 ' + visible + ' 个影片入口' : '当前页面共 ' + cached.length + ' 个影片入口';
      }
    }

    input.addEventListener('input', apply);
    apply();
  }

  function setupHlsPlayer() {
    var video = document.querySelector('[data-video-player]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-src');
    var overlay = document.querySelector('[data-player-overlay]');
    var status = document.querySelector('[data-player-status]');
    var hls = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('播放器已准备好，请再次点击播放。');
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    }

    function attachHls() {
      if (!source) {
        setStatus('当前影片暂无播放源。');
        return;
      }

      if (initialized) {
        playVideo();
        return;
      }

      initialized = true;
      setStatus('正在加载高清播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
          playVideo();
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          playVideo();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络加载异常，正在重试...');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体解码异常，正在恢复...');
            hls.recoverMediaError();
          } else {
            setStatus('播放源暂时无法加载，请稍后再试。');
            hls.destroy();
          }
        });
      } else {
        setStatus('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari。');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        overlay.hidden = true;
        attachHls();
      });
    }

    video.addEventListener('play', function () {
      if (!initialized) {
        attachHls();
      }
      if (overlay) {
        overlay.hidden = true;
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
