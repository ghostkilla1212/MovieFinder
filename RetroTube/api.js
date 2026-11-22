const archiveSearchUrl = 'https://archive.org/advancedsearch.php';
const movieContainer = document.getElementById('movie-container');
const movieStatus = document.getElementById('movie-status');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const assistantForm = document.getElementById('assistantForm');
const assistantInput = document.getElementById('assistantInput');
const assistantResponse = document.getElementById('assistantResponse');
let latestSearch = 0;

const genreTerms = [
    { subject: 'horror', terms: ['horror', 'scary', 'monster', 'grusel'] },
    { subject: 'comedy', terms: ['comedy', 'funny', 'humor', 'komodie', 'lustig'] },
    { subject: 'western', terms: ['western', 'cowboy'] },
    { subject: 'science fiction', terms: ['science fiction', 'sci fi', 'scifi', 'space', 'sci-fi'] },
    { subject: 'crime', terms: ['crime', 'detective', 'mystery', 'thriller', 'krimi'] },
    { subject: 'drama', terms: ['drama'] },
    { subject: 'romance', terms: ['romance', 'romantic', 'love story', 'romanze'] },
    { subject: 'adventure', terms: ['adventure', 'abenteuer'] },
    { subject: 'animation', terms: ['animation', 'cartoon', 'animated', 'zeichentrick'] },
    { subject: 'silent films', terms: ['silent film', 'silent', 'stummfilm'] }
];

const questionFillers = [
    'a', 'an', 'any', 'are', 'available', 'can', 'classic', 'could', 'do', 'film',
    'films', 'find', 'for', 'from', 'got', 'have', 'i', 'in', 'me', 'movie',
    'movies', 'of', 'old', 'on', 'please', 'retro', 'search', 'show', 'some',
    'the', 'to', 'want', 'was', 'what', 'were', 'you', 'suche', 'such', 'mir',
    'einen', 'eine', 'ein', 'film', 'filme', 'von', 'aus', 'dem', 'der', 'die',
    'das', 'mit', 'jahr', 'jahre', 'bitte', 'finde', 'zeige', 'alte', 'alten'
];

function normalizeQuestion(question) {
    return question
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function interpretMovieQuestion(question) {
    let remaining = normalizeQuestion(question);
    const plan = { fromAssistant: true };

    const yearRange = remaining.match(/\b((?:19|20)\d{2})\s+(?:to|through|bis)\s+((?:19|20)\d{2})\b/);
    const decade = remaining.match(/\b((?:19|20)\d)0s\b/);
    const germanDecade = remaining.match(/\b(19)?([1-6])0er(?:\s+jahre)?\b/);
    const year = remaining.match(/\b((?:19|20)\d{2})\b/);

    if (yearRange) {
        plan.startYear = Number(yearRange[1]);
        plan.endYear = Number(yearRange[2]);
        remaining = remaining.replace(yearRange[0], ' ');
    } else if (decade) {
        plan.startYear = Number(`${decade[1]}0`);
        plan.endYear = plan.startYear + 9;
        remaining = remaining.replace(decade[0], ' ');
    } else if (germanDecade) {
        plan.startYear = Number(`${germanDecade[1] || '19'}${germanDecade[2]}0`);
        plan.endYear = plan.startYear + 9;
        remaining = remaining.replace(germanDecade[0], ' ');
    } else if (year) {
        plan.startYear = Number(year[1]);
        plan.endYear = plan.startYear;
        remaining = remaining.replace(year[0], ' ');
    }

    const genre = genreTerms.find(({ terms }) => terms.some(term => {
        const pattern = new RegExp(`\\b${term}\\b`);
        return pattern.test(remaining);
    }));

    if (genre) {
        plan.subject = genre.subject;
        genre.terms.forEach(term => {
            remaining = remaining.replace(new RegExp(`\\b${term}\\b`, 'g'), ' ');
        });
    }

    const fillerPattern = new RegExp(`\\b(?:${questionFillers.join('|')})\\b`, 'g');
    plan.title = remaining.replace(fillerPattern, ' ').replace(/\s+/g, ' ').trim();
    plan.startYear = plan.startYear ?? 1900;
    plan.endYear = plan.endYear ?? 1969;
    plan.description = [
        plan.title && `Searching for "${plan.title}"`,
        plan.subject && `genre: ${plan.subject}`,
        (plan.startYear !== 1900 || plan.endYear !== 1969)
            && `years: ${plan.startYear}-${plan.endYear}`
    ].filter(Boolean).join(' · ') || 'Searching all retro movies from 1900-1969';

    return plan;
}

function createSearchQuery(searchTerm, filters = {}) {
    const startYear = Math.max(1900, filters.startYear ?? 1900);
    const endYear = Math.min(1969, filters.endYear ?? 1969);
    const queryParts = [
        'collection:feature_films',
        `year:[${startYear} TO ${endYear}]`
    ];
    const title = searchTerm.trim().replace(/\s+/g, ' ');

    if (filters.subject) {
        queryParts.push(`subject:"${filters.subject}"`);
    }

    if (title) {
        const escapedTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        queryParts.push(`title:"${escapedTitle}"`);
    }

    return queryParts.join(' AND ');
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

async function loadMovies(searchTerm = '', filters = {}) {
    const searchId = ++latestSearch;
    const params = new URLSearchParams();
    params.set('q', createSearchQuery(searchTerm, filters));
    params.append('fl[]', 'identifier');
    params.append('fl[]', 'title');
    params.append('fl[]', 'year');
    params.set('rows', '24');
    params.set('page', '1');
    params.set('output', 'json');
    params.append('sort[]', 'downloads desc');

    movieStatus.textContent = filters.fromAssistant
        ? 'Searching the retro movie collection ...'
        : 'Loading retro movies ...';
    if (filters.fromAssistant) {
        assistantResponse.textContent = filters.description;
    }
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
            if (filters.fromAssistant) {
                assistantResponse.textContent = `${filters.description}. No matching movies found.`;
            }
            return;
        }

        movies.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
        if (filters.fromAssistant) {
            assistantResponse.textContent = `${filters.description}. Found ${movies.length} movie${movies.length === 1 ? '' : 's'} below.`;
        }
    } catch (error) {
        if (searchId !== latestSearch) {
            return;
        }

        console.error('Could not load retro movies:', error);
        movieStatus.textContent = 'Could not load retro movies. Please try again later.';
        movieContainer.replaceChildren(movieStatus);
        if (filters.fromAssistant) {
            assistantResponse.textContent = 'The movie search failed. Please try again later.';
        }
    }
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadMovies(searchInput.value);
});

assistantForm.addEventListener('submit', event => {
    event.preventDefault();
    const question = assistantInput.value.trim();
    if (!question) {
        return;
    }

    const plan = interpretMovieQuestion(question);
    if (plan.startYear > 1969 || plan.endYear < 1900 || plan.startYear > plan.endYear) {
        assistantResponse.textContent = 'RetroTube can only search movies released between 1900 and 1969.';
        return;
    }

    loadMovies(plan.title, plan);
});

loadMovies();