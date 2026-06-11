(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
  var searchPanel = document.querySelector("[data-search-results]");

  function renderSearch(value) {
    if (!searchPanel || typeof SITE_SEARCH_DATA === "undefined") {
      return;
    }

    var query = value.trim().toLowerCase();

    if (!query) {
      searchPanel.classList.remove("show");
      searchPanel.innerHTML = "";
      return;
    }

    var results = SITE_SEARCH_DATA.filter(function (item) {
      return item.title.toLowerCase().indexOf(query) !== -1 ||
        item.category.toLowerCase().indexOf(query) !== -1 ||
        String(item.year).indexOf(query) !== -1 ||
        item.tags.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 12);

    searchPanel.innerHTML = results.map(function (item) {
      return '<a href="' + item.url + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.category + ' · ' + item.desc + '</span></a>';
    }).join("") || '<a href="./categories.html"><strong>浏览分类片库</strong><span>换一个关键词继续查找</span></a>';

    searchPanel.classList.add("show");
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      renderSearch(input.value);
    });

    input.addEventListener("focus", function () {
      renderSearch(input.value);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".header-search")) {
      if (searchPanel) {
        searchPanel.classList.remove("show");
      }
    }
  });

  var filterInput = document.querySelector("[data-filter-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  function applyPageFilter() {
    var term = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";

    cards.forEach(function (card) {
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var category = (card.getAttribute("data-category") || "").toLowerCase();
      var matchedTerm = !term || title.indexOf(term) !== -1 || category.indexOf(term) !== -1;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle("hide", !(matchedTerm && matchedYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyPageFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", applyPageFilter);
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q");

  if (initialQuery && filterInput) {
    filterInput.value = initialQuery;
    applyPageFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('form[role="search"]')).forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[type='search']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
    });
  });
})();
