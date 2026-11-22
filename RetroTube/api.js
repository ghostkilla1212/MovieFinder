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
    playButton.setAttribute('aria-label', `Play ${movie.title}`);
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
    fullscreenButton.textContent = 'Fullscreen';
    fullscreenButton.setAttribute('aria-label', `View ${movie.title} in fullscreen`);
    fullscreenButton.addEventListener('click', async () => {
        if (typeof player.requestFullscreen !== 'function') {
            fullscreenButton.textContent = 'Unavailable';
            fullscreenButton.title = 'Fullscreen is not supported by this browser.';
            fullscreenButton.disabled = true;
            return;
        }

        try {
            await player.requestFullscreen();
        } catch (error) {
            console.error('Could not enter fullscreen:', error);
            fullscreenButton.textContent = 'Error';
            fullscreenButton.title = 'Could not enter fullscreen.';
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
    year.textContent = `Release year: ${movie.year}`;

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

    movieStatus.textContent = 'Loading retro movies ...';
    movieContainer.replaceChildren(movieStatus);

    try {
        const response = await fetch(`${archiveSearchUrl}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`The movie API returned HTTP ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data.response?.docs)) {
            throw new Error('The movie API returned an invalid response.');
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
            movieStatus.textContent = 'No matching retro movies found.';
            movieContainer.appendChild(movieStatus);
            return;
        }

        movies.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
    } catch (error) {
        if (searchId !== latestSearch) {
            return;
        }

        console.error('Could not load retro movies:', error);
        movieStatus.textContent = 'Could not load retro movies. Please try again later.';
        movieContainer.replaceChildren(movieStatus);
    }
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadMovies(searchInput.value);
});

loadMovies();