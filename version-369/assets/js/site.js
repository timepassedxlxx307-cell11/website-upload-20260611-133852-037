(function() {
  var header = document.querySelector('[data-site-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuToggle && mobileNav && header) {
    menuToggle.addEventListener('click', function() {
      header.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function(carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function(panel) {
    var container = panel.parentElement;
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-filter-card]'));
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var category = panel.querySelector('[data-filter-category]');
    var empty = container.querySelector('[data-empty-state]');

    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      var numeric = parseInt(cardYear, 10);
      if (selected === 'older') {
        return numeric && numeric < 2000;
      }
      if (selected === '2000') {
        return numeric >= 2000 && numeric < 2010;
      }
      if (selected === '2010') {
        return numeric >= 2010 && numeric < 2020;
      }
      return cardYear.indexOf(selected) !== -1;
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var selectedCategory = category ? category.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var searchable = (card.dataset.searchable || '').toLowerCase();
        var okQuery = !query || searchable.indexOf(query) !== -1;
        var okYear = matchYear(card.dataset.year || '', selectedYear);
        var okType = !selectedType || (card.dataset.type || '').indexOf(selectedType) !== -1;
        var okCategory = !selectedCategory || (card.dataset.category || '').indexOf(selectedCategory) !== -1;
        var ok = okQuery && okYear && okType && okCategory;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type, category].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
