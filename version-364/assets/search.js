(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function card(movie) {
        return [
            '<article class="movie-card" data-card>',
            '<a class="card-poster" href="' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
            '<span class="card-play">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function runSearch(query) {
        var list = window.SITE_MOVIES || [];
        var results = document.querySelector('[data-search-results]');
        var empty = document.querySelector('[data-empty]');
        if (!results) {
            return;
        }
        var keyword = String(query || '').toLowerCase().trim();
        var matched = list.filter(function (movie) {
            if (!keyword) {
                return true;
            }
            return movie.search.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 240);
        results.innerHTML = matched.map(card).join('');
        if (empty) {
            empty.classList.toggle('show', matched.length === 0);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('[data-search-page-input]');
        var form = document.querySelector('[data-search-page-form]');
        var query = getQuery();
        if (input) {
            input.value = query;
        }
        runSearch(query);
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var nextQuery = input ? input.value.trim() : '';
                var nextUrl = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
                window.history.replaceState(null, '', nextUrl);
                runSearch(nextQuery);
            });
        }
    });
})();
