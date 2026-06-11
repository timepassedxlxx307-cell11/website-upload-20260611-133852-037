const Hls = window.Hls;

const mobileButton = document.querySelector('.menu-toggle');
const mobilePanel = document.querySelector('.mobile-panel');

if (mobileButton && mobilePanel) {
  mobileButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  const start = () => {
    if (timer || slides.length < 2) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      stop();
      showSlide(dotIndex);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const filterPanels = document.querySelectorAll('[data-filter-panel]');

filterPanels.forEach((panel) => {
  const list = panel.parentElement.querySelector('[data-card-list]');
  if (!list) return;

  const keywordInput = panel.querySelector('[data-filter-keyword]');
  const yearSelect = panel.querySelector('[data-filter-year]');
  const typeSelect = panel.querySelector('[data-filter-type]');
  const cards = Array.from(list.querySelectorAll('.movie-card'));
  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get('q');

  if (keywordInput && queryValue) {
    keywordInput.value = queryValue;
  }

  const applyFilter = () => {
    const keyword = normalizeText(keywordInput && keywordInput.value);
    const year = normalizeText(yearSelect && yearSelect.value);
    const type = normalizeText(typeSelect && typeSelect.value);

    cards.forEach((card) => {
      const haystack = normalizeText([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre
      ].join(' '));
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchYear = !year || normalizeText(card.dataset.year) === year;
      const matchType = !type || normalizeText(card.dataset.type) === type;
      card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
    });
  };

  [keywordInput, yearSelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  applyFilter();
});

const playerCards = document.querySelectorAll('.player-card');

playerCards.forEach((card) => {
  const video = card.querySelector('video');
  const button = card.querySelector('.player-start');
  const streamUrl = card.dataset.stream;
  let mediaReady = false;
  let hlsInstance = null;

  const attachMedia = () => {
    if (!video || !streamUrl || mediaReady) return;

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }

    mediaReady = true;
  };

  const playMedia = async () => {
    attachMedia();
    card.classList.add('is-playing');
    try {
      await video.play();
    } catch (error) {
      card.classList.remove('is-playing');
    }
  };

  if (button) {
    button.addEventListener('click', playMedia);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        playMedia();
      }
    });

    video.addEventListener('play', () => {
      card.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        card.classList.remove('is-playing');
      }
    });
  }

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
