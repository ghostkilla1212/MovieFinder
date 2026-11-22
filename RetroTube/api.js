const archiveSearchUrl = 'https://archive.org/advancedsearch.php';
const movieContainer = document.getElementById('movie-container');
const movieStatus = document.getElementById('movie-status');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
let latestSearch = 0;

function createSearchQuery(searchTerm) {
    const retroFilter = 'collection:feature_films AND year:[1900 TO 1969]';
    const title = searchTerm.trim().replace(/\s+/g, ' ');

    if (!title) {
        return retroFilter;
    }

    const escapedTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${retroFilter} AND title:"${escapedTitle}"`;
}

function createMovieCard(movie) {
    const card = document.createElement('article');
    card.className = 'movie-card';

    const player = document.createElement('div');
    player.className = 'player-container';

    const poster = document.createElement('img');
    poster.src = `https://archive.org/services/img/${encodeURIComponent(movie.identifier)}`;
    poster.alt = `Poster: ${movie.title}`;
    poster.loading = 'lazy';
    player.appendChild(poster);

    const playButton = document.createElement('button');
    playButton.className = 'play-btn';
    playButton.type = 'button';
    playButton.setAttribute('aria-label', `${movie.title} abspielen`);
    playButton.addEventListener('click', () => {
        const video = document.createElement('iframe');
        video.src = `https://archive.org/embed/${encodeURIComponent(movie.identifier)}`;
        video.title = movie.title;
        video.allow = 'autoplay; fullscreen';
        video.allowFullscreen = true;
        player.replaceChildren(video);
        player.appendChild(fullscreenButton);
    });
    player.appendChild(playButton);

    const fullscreenButton = document.createElement('button');
    fullscreenButton.className = 'fullscreen-btn';
    fullscreenButton.type = 'button';
    fullscreenButton.textContent = 'Vollbild';
    fullscreenButton.setAttribute('aria-label', `${movie.title} im Vollbild anzeigen`);
    fullscreenButton.addEventListener('click', async () => {
        if (typeof player.requestFullscreen !== 'function') {
            fullscreenButton.textContent = 'Nicht verfügbar';
            fullscreenButton.title = 'Vollbild wird von diesem Browser nicht unterstützt.';
            fullscreenButton.disabled = true;
            return;
        }

        try {
            await player.requestFullscreen();
        } catch (error) {
            console.error('Vollbild konnte nicht gestartet werden:', error);
            fullscreenButton.textContent = 'Fehler';
            fullscreenButton.title = 'Vollbild konnte nicht gestartet werden.';
        }
    });
    player.appendChild(fullscreenButton);

    const info = document.createElement('div');
    info.className = 'movie-info';

    const title = document.createElement('h2');
    title.className = 'movie-title';
    title.textContent = movie.title;

    const year = document.createElement('p');
    year.className = 'movie-meta';
    year.textContent = `Erscheinungsjahr: ${movie.year}`;

    info.append(title, year);
    card.append(player, info);
    return card;
}

async function loadMovies(searchTerm = '') {
    const searchId = ++latestSearch;
    const params = new URLSearchParams();
    params.set('q', createSearchQuery(searchTerm));
    params.append('fl[]', 'identifier');
    params.append('fl[]', 'title');
    params.append('fl[]', 'year');
    params.set('rows', '24');
    params.set('page', '1');
    params.set('output', 'json');
    params.append('sort[]', 'downloads desc');

    movieStatus.textContent = 'Retrofilme werden geladen ...';
    movieContainer.replaceChildren(movieStatus);

    try {
        const response = await fetch(`${archiveSearchUrl}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Die Film-API antwortet mit HTTP ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data.response?.docs)) {
            throw new Error('Die Film-API hat eine ungültige Antwort geliefert.');
        }

        if (searchId !== latestSearch) {
            return;
        }

        const movies = data.response.docs
            .filter(movie => movie.identifier && movie.title)
            .map(movie => ({ ...movie, year: Number(movie.year) }))
            .filter(movie => Number.isInteger(movie.year) && movie.year >= 1900 && movie.year <= 1969);

        movieContainer.replaceChildren();
        if (movies.length === 0) {
            movieStatus.textContent = 'Keine passenden Retrofilme gefunden.';
            movieContainer.appendChild(movieStatus);
            return;
        }

        movies.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
    } catch (error) {
        if (searchId !== latestSearch) {
            return;
        }

        console.error('Fehler beim Laden der Retrofilme:', error);
        movieStatus.textContent = 'Die Retrofilme konnten nicht geladen werden. Bitte versuche es später erneut.';
        movieContainer.replaceChildren(movieStatus);
    }
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadMovies(searchInput.value);
});

loadMovies();