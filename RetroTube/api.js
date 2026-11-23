const archiveSearchUrl = 'https://archive.org/advancedsearch.php';
const movieContainer = document.getElementById('movie-container');
const movieStatus = document.getElementById('movie-status');
const dailyTopList = document.getElementById('daily-top-list');
const dailyTopStatus = document.getElementById('daily-top-status');
const dailyTopTitle = document.getElementById('daily-top-title');
const dailyTopNote = document.querySelector('.daily-top-note');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const assistantForm = document.getElementById('assistantForm');
const assistantInput = document.getElementById('assistantInput');
const assistantResponse = document.getElementById('assistantResponse');
const assistantToggle = document.getElementById('assistantToggle');
const assistantBackdrop = document.getElementById('assistantBackdrop');
const assistantClose = document.getElementById('assistantClose');
const decadeButtons = document.querySelectorAll('.decade-button');
const categoryButtons = document.querySelectorAll('.category-button');
const cartoonCategoryButtons = document.querySelectorAll('.cartoon-category-button');
const cartoonCategoryList = document.getElementById('cartoonCategoryList');
const cartoonIntro = document.getElementById('cartoonIntro');
const cartoonIntroClose = document.getElementById('cartoonIntroClose');
const horrorIntro = document.getElementById('horrorIntro');
const horrorIntroClose = document.getElementById('horrorIntroClose');
const movieSentinel = document.getElementById('movie-sentinel');
const MIN_MOVIE_YEAR = 1900;
const MAX_MOVIE_YEAR = 1999;
const FAVORITES_STORAGE_KEY = 'retrotube-favorites-v1';
let latestSearch = 0;
let currentPage = 1;
let hasMoreMovies = true;
let isLoadingMovies = false;
let currentMovieRequest = { searchTerm: '', filters: {} };

function getFavorites() {
    try {
        const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
        return Array.isArray(storedFavorites) ? storedFavorites : [];
    } catch (error) {
        console.error('Could not read saved favorites:', error);
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error('Could not save favorites:', error);
    }
    updateFavoriteCount();
}

function isFavorite(identifier) {
    return getFavorites().some(movie => movie.identifier === identifier);
}

function toggleFavorite(movie) {
    const favorites = getFavorites();
    const existingIndex = favorites.findIndex(savedMovie => savedMovie.identifier === movie.identifier);
    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
    } else {
        favorites.unshift({
            identifier: movie.identifier,
            title: movie.title,
            year: movie.year
        });
    }
    saveFavorites(favorites);
    return existingIndex < 0;
}

function updateFavoriteCount() {
    const favoriteCount = document.getElementById('favoriteCount');
    if (favoriteCount) {
        favoriteCount.textContent = String(getFavorites().length);
    }

    document.querySelectorAll('.favorite-btn').forEach(button => {
        const saved = isFavorite(button.dataset.identifier);
        button.classList.toggle('is-favorite', saved);
        button.setAttribute('aria-pressed', String(saved));
        button.title = saved ? 'Remove from favorites' : 'Add to favorites';
        button.setAttribute('aria-label', saved
            ? `Remove ${button.dataset.title} from favorites`
            : `Add ${button.dataset.title} to favorites`);
    });
}

function loadFavorites() {
    ++latestSearch;
    hasMoreMovies = false;
    isLoadingMovies = false;
    currentMovieRequest = { searchTerm: '', filters: { category: 'favorites' } };
    const favorites = getFavorites();

    movieContainer.replaceChildren();
    if (favorites.length === 0) {
        movieStatus.textContent = 'No favorite movies saved yet.';
        movieContainer.appendChild(movieStatus);
        return;
    }

    favorites.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
    updateFavoriteCount();
}

function openAssistant() {
    assistantBackdrop.hidden = false;
    document.body.classList.add('assistant-open');
    assistantInput.focus();
}

function closeAssistant() {
    assistantBackdrop.hidden = true;
    document.body.classList.remove('assistant-open');
    assistantToggle.focus();
}

const genreTerms = [
    { subject: 'horror', terms: ['horror', 'horrorfilm', 'horrorfilme', 'scary', 'monster', 'grusel'] },
    { subject: 'comedy', terms: ['comedy', 'funny', 'humor', 'komodie', 'komodien', 'lustig'] },
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
    'das', 'den', 'mit', 'jahr', 'jahre', 'bitte', 'finde', 'zeige', 'alte', 'alten'
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
    const germanDecade = remaining.match(/\b(19)?([1-9])0er(?:\s+jahre)?\b/);
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
    plan.startYear = plan.startYear ?? MIN_MOVIE_YEAR;
    plan.endYear = plan.endYear ?? MAX_MOVIE_YEAR;
    plan.description = [
        plan.title && `Searching for "${plan.title}"`,
        plan.subject && `genre: ${plan.subject}`,
        (plan.startYear !== MIN_MOVIE_YEAR || plan.endYear !== MAX_MOVIE_YEAR)
            && `years: ${plan.startYear}-${plan.endYear}`
    ].filter(Boolean).join(' · ') || `Searching all retro movies from ${MIN_MOVIE_YEAR}-${MAX_MOVIE_YEAR}`;

    return plan;
}

function createSearchQuery(searchTerm, filters = {}) {
    const startYear = Math.max(MIN_MOVIE_YEAR, filters.startYear ?? MIN_MOVIE_YEAR);
    const endYear = Math.min(MAX_MOVIE_YEAR, filters.endYear ?? MAX_MOVIE_YEAR);
    const queryParts = [
        'collection:feature_films',
        `year:[${startYear} TO ${endYear}]`
    ];

    if (filters.category === 'cartoons') {
        queryParts[0] = '(collection:animationandcartoons OR subject:"cartoon" OR subject:"animation")';
        if (filters.cartoonQuery) {
            const escapedQuery = filters.cartoonQuery.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            queryParts.push(`(title:"${escapedQuery}" OR subject:"${escapedQuery}")`);
        } else if (filters.subject) {
            queryParts.push(`subject:"${filters.subject}"`);
        }
    } else if (filters.category === 'horror') {
        queryParts[0] = '(subject:"horror" OR subject:"horror film" OR subject:"horror movies" OR title:horror)';
    }
    const title = searchTerm.trim().replace(/\s+/g, ' ');

    if (filters.subject && filters.category !== 'cartoons') {
        queryParts.push(`subject:"${filters.subject}"`);
    }

    if (title) {
        const escapedTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        queryParts.push(`title:"${escapedTitle}"`);
    }

    return queryParts.join(' AND ');
}

function createMovieCard(movie, rank = 0) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    if (rank > 0) {
        card.classList.add('daily-card');
    }

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

    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-btn';
    favoriteButton.type = 'button';
    favoriteButton.dataset.identifier = movie.identifier;
    favoriteButton.dataset.title = movie.title;
    favoriteButton.textContent = '★';
    const savedInitially = isFavorite(movie.identifier);
    favoriteButton.classList.toggle('is-favorite', savedInitially);
    favoriteButton.setAttribute('aria-pressed', String(savedInitially));
    favoriteButton.title = savedInitially ? 'Remove from favorites' : 'Add to favorites';
    favoriteButton.setAttribute('aria-label', savedInitially
        ? `Remove ${movie.title} from favorites`
        : `Add ${movie.title} to favorites`);
    favoriteButton.addEventListener('click', () => {
        toggleFavorite(movie);
        if (getActiveCategory() === 'favorites') {
            loadFavorites();
        } else {
            updateFavoriteCount();
        }
    });
    player.appendChild(favoriteButton);

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

    if (rank > 0) {
        const rankNumber = document.createElement('span');
        rankNumber.className = 'daily-rank';
        rankNumber.textContent = String(rank);
        rankNumber.setAttribute('aria-label', `Number ${rank}`);
        player.appendChild(rankNumber);
    }

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

function getDailyTopFive(movies) {
    const now = new Date();
    const dayIndex = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const startIndex = (dayIndex * 5) % movies.length;

    return Array.from({ length: Math.min(5, movies.length) }, (_, index) => {
        return movies[(startIndex + index) % movies.length];
    });
}

async function loadDailyTopFive(category = 'all', subject = '', cartoonQuery = '') {
    const queryParts = [`year:[${MIN_MOVIE_YEAR} TO ${MAX_MOVIE_YEAR}]`];

    if (category === 'cartoons') {
        queryParts.unshift('(collection:animationandcartoons OR subject:"cartoon" OR subject:"animation")');
        if (cartoonQuery) {
            const escapedQuery = cartoonQuery.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            queryParts.push(`(title:"${escapedQuery}" OR subject:"${escapedQuery}")`);
        } else if (subject) {
            queryParts.push(`subject:"${subject}"`);
        }
    } else if (category === 'horror') {
        queryParts.unshift('(subject:"horror" OR subject:"horror film" OR subject:"horror movies" OR title:horror)');
    } else {
        queryParts.unshift('collection:feature_films');
    }

    const params = new URLSearchParams();
    params.set('q', queryParts.join(' AND '));
    params.append('fl[]', 'identifier');
    params.append('fl[]', 'title');
    params.append('fl[]', 'year');
    params.set('rows', '50');
    params.set('page', '1');
    params.set('output', 'json');
    params.append('sort[]', 'downloads desc');

    try {
        const response = await fetch(`${archiveSearchUrl}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`The movie API returned HTTP ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data.response?.docs)) {
            throw new Error('The movie API returned an invalid response.');
        }

        const movies = data.response.docs
            .filter(movie => movie.identifier && movie.title)
            .map(movie => ({ ...movie, year: Number(movie.year) }))
            .filter(movie => Number.isInteger(movie.year)
                && movie.year >= MIN_MOVIE_YEAR
                && movie.year <= MAX_MOVIE_YEAR);
        const dailyPicks = getDailyTopFive(movies);

        dailyTopList.replaceChildren();
        if (dailyPicks.length === 0) {
            dailyTopStatus.textContent = 'No daily picks are available right now.';
            dailyTopList.appendChild(dailyTopStatus);
            return;
        }

        dailyPicks.forEach((movie, index) => {
            dailyTopList.appendChild(createMovieCard(movie, index + 1));
        });
    } catch (error) {
        console.error('Could not load the daily top five:', error);
        dailyTopStatus.textContent = 'Could not load today’s picks. Please try again later.';
        dailyTopList.replaceChildren(dailyTopStatus);
    }
}

function scheduleDailyTopFiveRefresh() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());

    window.setTimeout(() => {
        const category = getActiveCategory();
        loadDailyTopFive(
            category,
            category === 'cartoons' ? getActiveCartoonSubject() : '',
            category === 'cartoons' ? getActiveCartoonQuery() : ''
        );
        scheduleDailyTopFiveRefresh();
    }, delay);
}

async function fetchMoviePage(searchTerm, filters, page) {
    const params = new URLSearchParams();
    params.set('q', createSearchQuery(searchTerm, filters));
    params.append('fl[]', 'identifier');
    params.append('fl[]', 'title');
    params.append('fl[]', 'year');
    params.append('fl[]', 'licenseurl');
    params.append('fl[]', 'rights');
    params.append('fl[]', 'collection');
    params.set('rows', '24');
    params.set('page', String(page));
    params.set('output', 'json');
    params.append('sort[]', 'downloads desc');

    const response = await fetch(`${archiveSearchUrl}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`The movie API returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    if (!Array.isArray(data.response?.docs)) {
        throw new Error('The movie API returned an invalid response.');
    }

    const movies = data.response.docs
        .filter(movie => movie.identifier && movie.title)
        .map(movie => ({ ...movie, year: Number(movie.year) }))
        .filter(movie => Number.isInteger(movie.year)
            && movie.year >= MIN_MOVIE_YEAR
            && movie.year <= MAX_MOVIE_YEAR);

    return {
        movies,
        found: Number(data.response.numFound || 0)
    };
}

async function loadMovies(searchTerm = '', filters = {}) {
    const searchId = ++latestSearch;
    currentPage = 1;
    hasMoreMovies = true;
    isLoadingMovies = false;
    currentMovieRequest = { searchTerm, filters };

    movieStatus.textContent = filters.fromAssistant
        ? 'Searching the retro movie collection ...'
        : filters.category === 'cartoons'
            ? 'Loading cartoon movies ...'
            : filters.category === 'horror'
                ? 'Loading horror movies ...'
                : 'Loading retro movies ...';
    if (filters.fromAssistant) {
        assistantResponse.textContent = filters.description;
    }
    movieContainer.replaceChildren(movieStatus);

    await loadNextMovies(searchId);
}

async function loadNextMovies(searchId = latestSearch) {
    if (isLoadingMovies || !hasMoreMovies || searchId !== latestSearch) {
        return;
    }

    isLoadingMovies = true;
    if (currentPage > 1) {
        movieStatus.textContent = 'Loading more movies ...';
        movieContainer.appendChild(movieStatus);
    }

    try {
        const result = await fetchMoviePage(
            currentMovieRequest.searchTerm,
            currentMovieRequest.filters,
            currentPage
        );

        if (searchId !== latestSearch) {
            return;
        }

        movieStatus.remove();
        if (currentPage === 1 && result.movies.length === 0) {
            movieStatus.textContent = currentMovieRequest.filters.category === 'cartoons'
                ? 'No cartoon movies found.'
                : currentMovieRequest.filters.category === 'horror'
                    ? 'No horror movies found.'
                    : 'No matching retro movies found.';
            movieContainer.appendChild(movieStatus);
            hasMoreMovies = false;
            if (currentMovieRequest.filters.fromAssistant) {
                assistantResponse.textContent = `${currentMovieRequest.filters.description}. No matching movies found.`;
            }
            return;
        }

        result.movies.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
        if (currentMovieRequest.filters.fromAssistant) {
            const prefix = currentPage === 1 ? result.movies.length : 'More';
            assistantResponse.textContent = `${currentMovieRequest.filters.description}. ${prefix} movie${result.movies.length === 1 ? '' : 's'} loaded below.`;
        }

        hasMoreMovies = currentPage * 24 < result.found;
        currentPage += 1;
        if (!hasMoreMovies) {
            movieStatus.textContent = 'All movies loaded.';
            movieContainer.appendChild(movieStatus);
        }
    } catch (error) {
        if (searchId !== latestSearch) {
            return;
        }

        console.error('Could not load retro movies:', error);
        movieStatus.remove();
        movieStatus.textContent = 'Could not load retro movies. Please try again later.';
        movieContainer.appendChild(movieStatus);
        hasMoreMovies = false;
        if (currentMovieRequest.filters.fromAssistant) {
            assistantResponse.textContent = 'The movie search failed. Please try again later.';
        }
    } finally {
        isLoadingMovies = false;
    }
}

function setActiveDecade(selectedDecade) {
    decadeButtons.forEach(button => {
        const isActive = button.dataset.decade === selectedDecade;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    if (getActiveCategory() === 'favorites') {
        setActiveCategory('all');
    }
    const activeDecade = document.querySelector('.decade-button.is-active');
    loadMovies(searchInput.value, {
        startYear: activeDecade ? Number(activeDecade.dataset.startYear) : MIN_MOVIE_YEAR,
        endYear: activeDecade ? Number(activeDecade.dataset.endYear) : MAX_MOVIE_YEAR,
        category: getActiveCategory(),
        subject: getActiveCategory() === 'cartoons' ? getActiveCartoonSubject() : '',
        cartoonQuery: getActiveCategory() === 'cartoons' ? getActiveCartoonQuery() : ''
    });
});

assistantForm.addEventListener('submit', event => {
    event.preventDefault();
    if (getActiveCategory() === 'favorites') {
        setActiveCategory('all');
    }
    const question = assistantInput.value.trim();
    if (!question) {
        return;
    }

    const plan = interpretMovieQuestion(question);
    if (plan.startYear < MIN_MOVIE_YEAR
        || plan.endYear > MAX_MOVIE_YEAR
        || plan.startYear > plan.endYear) {
        assistantResponse.textContent = `RetroTube can only search movies released between ${MIN_MOVIE_YEAR} and ${MAX_MOVIE_YEAR}.`;
        return;
    }

    setActiveDecade('all');
    plan.category = getActiveCategory();
    plan.subject = plan.category === 'cartoons' ? getActiveCartoonSubject() : '';
    plan.cartoonQuery = plan.category === 'cartoons' ? getActiveCartoonQuery() : '';
    loadMovies(plan.title, plan);
});

decadeButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveDecade(button.dataset.decade);
        if (getActiveCategory() === 'favorites') {
            setActiveCategory('all');
        }
        loadMovies('', {
            startYear: Number(button.dataset.startYear),
            endYear: Number(button.dataset.endYear),
            category: getActiveCategory(),
            decade: button.dataset.decade === 'all' ? '' : button.textContent.trim(),
            subject: getActiveCategory() === 'cartoons' ? getActiveCartoonSubject() : '',
            cartoonQuery: getActiveCategory() === 'cartoons' ? getActiveCartoonQuery() : ''
        });
    });
});

function getActiveCategory() {
    const activeCategory = document.querySelector('.category-button.is-active');
    return activeCategory ? activeCategory.dataset.category : 'all';
}

let cartoonIntroTimer = 0;
let horrorIntroTimer = 0;

function closeCartoonIntro() {
    window.clearTimeout(cartoonIntroTimer);
    cartoonIntro.hidden = true;
    document.body.classList.remove('cartoon-intro-open');
}

function playCartoonIntro() {
    window.clearTimeout(cartoonIntroTimer);
    cartoonIntro.hidden = false;
    document.body.classList.add('cartoon-intro-open');
    cartoonIntroClose.focus();
    cartoonIntroTimer = window.setTimeout(closeCartoonIntro, 6000);
}

function closeHorrorIntro() {
    window.clearTimeout(horrorIntroTimer);
    horrorIntro.hidden = true;
    document.body.classList.remove('horror-intro-open');
}

function playHorrorIntro() {
    window.clearTimeout(horrorIntroTimer);
    horrorIntro.hidden = false;
    document.body.classList.add('horror-intro-open');
    horrorIntroClose.focus();
    horrorIntroTimer = window.setTimeout(closeHorrorIntro, 6000);
}

function setActiveCategory(category) {
    categoryButtons.forEach(button => {
        const isActive = button.dataset.category === category;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
    document.body.classList.toggle('cartoon-theme', category === 'cartoons');
    document.body.classList.toggle('horror-theme', category === 'horror');
    cartoonCategoryList.hidden = category !== 'cartoons';

    if (category === 'favorites') {
        document.querySelector('.daily-top').hidden = true;
    } else if (category === 'cartoons') {
        document.querySelector('.daily-top').hidden = false;
        dailyTopTitle.textContent = "Today's Top 5 Cartoons";
        dailyTopNote.textContent = 'Daily rotating picks from the Internet Archive cartoon collection.';
        loadDailyTopFive('cartoons', getActiveCartoonSubject(), getActiveCartoonQuery());
        playCartoonIntro();
    } else if (category === 'horror') {
        document.querySelector('.daily-top').hidden = false;
        dailyTopTitle.textContent = "Today's Top 5 Horror";
        dailyTopNote.textContent = 'Daily rotating picks from the Internet Archive horror collection.';
        loadDailyTopFive('horror');
        playHorrorIntro();
    } else {
        document.querySelector('.daily-top').hidden = false;
        dailyTopTitle.textContent = "Today's Top 5";
        dailyTopNote.textContent = 'Daily rotating picks from popular Internet Archive movies, not live view counts.';
        loadDailyTopFive();
    }
}

function getActiveCartoonSubject() {
    const activeSubject = document.querySelector('.cartoon-category-button.is-active');
    return activeSubject ? activeSubject.dataset.subject : '';
}

function getActiveCartoonQuery() {
    const activeSubject = document.querySelector('.cartoon-category-button.is-active');
    return activeSubject ? activeSubject.dataset.query || '' : '';
}

cartoonCategoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        cartoonCategoryButtons.forEach(categoryButton => {
            const isActive = categoryButton === button;
            categoryButton.classList.toggle('is-active', isActive);
            categoryButton.setAttribute('aria-pressed', String(isActive));
        });

        const activeDecade = document.querySelector('.decade-button.is-active');
        loadMovies('', {
            startYear: activeDecade ? Number(activeDecade.dataset.startYear) : MIN_MOVIE_YEAR,
            endYear: activeDecade ? Number(activeDecade.dataset.endYear) : MAX_MOVIE_YEAR,
            category: 'cartoons',
            subject: button.dataset.subject,
            cartoonQuery: button.dataset.query || ''
        });
        loadDailyTopFive('cartoons', button.dataset.subject, button.dataset.query || '');
    });
});

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveCategory(button.dataset.category);
        if (button.dataset.category === 'favorites') {
            document.querySelector('.daily-top').hidden = true;
            cartoonCategoryList.hidden = true;
            loadFavorites();
            return;
        }
        document.querySelector('.daily-top').hidden = false;
        const activeDecade = document.querySelector('.decade-button.is-active');
        loadMovies('', {
            startYear: activeDecade ? Number(activeDecade.dataset.startYear) : MIN_MOVIE_YEAR,
            endYear: activeDecade ? Number(activeDecade.dataset.endYear) : MAX_MOVIE_YEAR,
            category: button.dataset.category,
            subject: button.dataset.category === 'cartoons' ? getActiveCartoonSubject() : '',
            cartoonQuery: button.dataset.category === 'cartoons' ? getActiveCartoonQuery() : '',
            decade: activeDecade && activeDecade.dataset.decade !== 'all'
                ? activeDecade.textContent.trim()
                : ''
        });
    });
});

if ('IntersectionObserver' in window) {
    const movieObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
            loadNextMovies();
        }
    }, { rootMargin: '400px 0px' });
    movieObserver.observe(movieSentinel);
}

cartoonIntroClose.addEventListener('click', closeCartoonIntro);
cartoonIntro.addEventListener('click', event => {
    if (event.target === cartoonIntro) {
        closeCartoonIntro();
    }
});
horrorIntroClose.addEventListener('click', closeHorrorIntro);
horrorIntro.addEventListener('click', event => {
    if (event.target === horrorIntro) {
        closeHorrorIntro();
    }
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !cartoonIntro.hidden) {
        closeCartoonIntro();
    }
    if (event.key === 'Escape' && !horrorIntro.hidden) {
        closeHorrorIntro();
    }
});

window.addEventListener('storage', event => {
    if (event.key === FAVORITES_STORAGE_KEY) {
        updateFavoriteCount();
        if (getActiveCategory() === 'favorites') {
            loadFavorites();
        }
    }
});

updateFavoriteCount();

assistantToggle.addEventListener('click', openAssistant);
assistantClose.addEventListener('click', closeAssistant);
assistantBackdrop.addEventListener('click', event => {
    if (event.target === assistantBackdrop) {
        closeAssistant();
    }
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !assistantBackdrop.hidden) {
        closeAssistant();
    }
});

loadMovies();
loadDailyTopFive();
scheduleDailyTopFiveRefresh();