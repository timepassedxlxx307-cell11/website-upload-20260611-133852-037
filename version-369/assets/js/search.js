(function() {
  var input = document.getElementById('siteSearchInput');
  var button = document.getElementById('siteSearchButton');
  var results = document.getElementById('siteSearchResults');
  var count = document.getElementById('siteSearchCount');

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
        '<div class="card-media">' +
          '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="card-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="card-type">' + escapeHtml(movie.type) + '</span>' +
          '<span class="card-play">▶</span>' +
        '</div>' +
        '<div class="card-body compact">' +
          '<h2>' + escapeHtml(movie.title) + '</h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</a>' +
    '</article>';
  }

  function runSearch() {
    if (!results || !window.MOVIE_INDEX) {
      return;
    }

    var query = input ? input.value.trim().toLowerCase() : '';
    var matches = window.MOVIE_INDEX.filter(function(movie) {
      if (!query) {
        return true;
      }
      return (movie.search || '').toLowerCase().indexOf(query) !== -1;
    });

    if (count) {
      count.textContent = query ? '搜索结果' : '热门内容';
    }

    results.innerHTML = matches.slice(0, 80).map(card).join('');
  }

  if (button) {
    button.addEventListener('click', runSearch);
  }

  if (input) {
    input.addEventListener('input', runSearch);
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        runSearch();
      }
    });
  }

  runSearch();
})();
