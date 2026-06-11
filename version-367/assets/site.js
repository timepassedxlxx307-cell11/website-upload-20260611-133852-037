(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mainNav = document.querySelector(".main-nav");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var input = panel.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = scope.querySelector(".empty-state");
    var filterField = "";
    var filterValue = "";

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchChip = true;

        if (filterField && filterValue) {
          matchChip = (card.getAttribute("data-" + filterField) || "") === filterValue;
        }

        var shouldShow = matchKeyword && matchChip;
        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });

        chip.classList.add("is-active");
        filterField = chip.getAttribute("data-filter-field") || "";
        filterValue = chip.getAttribute("data-filter-value") || "";
        applyFilter();
      });
    });
  });
})();
