(function () {
  var header = document.getElementById("siteHeader");
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  function handleScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-empty");
    });
  });

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(next);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var list = scope.querySelector("[data-filter-list]");
    var genreButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-genre]"));
    var categoryButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-category]"));
    var genreValue = "";
    var categoryValue = "";

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" "));
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var yearValue = normalize(year ? year.value : "");
      var typeValue = normalize(type ? type.value : "");
      var genre = normalize(genreValue);
      var category = normalize(categoryValue);

      cards.forEach(function (card) {
        var text = cardText(card);
        var ok = true;

        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
          ok = false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
          ok = false;
        }
        if (genre && normalize(card.getAttribute("data-genre")).indexOf(genre) === -1) {
          ok = false;
        }
        if (category && normalize(card.getAttribute("data-category")) !== category) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
    }

    if (year) {
      year.addEventListener("change", apply);
    }

    if (type) {
      type.addEventListener("change", apply);
    }

    genreButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        genreValue = button.getAttribute("data-filter-genre") || "";
        genreButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        categoryValue = button.getAttribute("data-filter-category") || "";
        categoryButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    apply();
  });
})();
