const languageButton = document.getElementById('languageButton');
const languageOptions = document.getElementById('languageOptions');
const languageLabel = document.getElementById('languageLabel');

const translations = {
    en: {
        name: 'English',
        searchPlaceholder: 'Search retro movies ...',
        login: 'Login',
        legal: 'Legal',
        createAccount: 'Create account',
        accountNote: 'Demo account only — details disappear when the page is refreshed.',
        username: 'Username',
        password: 'Password',
        profilePicture: 'Profile picture',
        createAccountButton: 'Create account',
        topFive: "Today's Top 5",
        topFiveCartoons: "Today's Top 5 Cartoons",
        topFiveNote: 'Daily rotating picks from popular Internet Archive movies, not live view counts.',
        topFiveCartoonNote: 'Daily rotating picks from the Internet Archive cartoon collection.',
        allMovies: 'All movies',
        cartoonMovies: 'Cartoon Movies',
        allCartoons: 'All cartoons',
        action: 'Action',
        fantasy: 'Fantasy',
        comedy: 'Comedy',
        adventure: 'Adventure',
        scifi: 'Sci-Fi',
        askAI: 'Ask AI',
        favorites: 'Favorites',
        loading: 'Loading retro movies ...'
    },
    de: {
        name: 'Deutsch',
        searchPlaceholder: 'Retromovies suchen ...',
        login: 'Anmelden',
        legal: 'Rechtliches',
        createAccount: 'Konto erstellen',
        accountNote: 'Nur ein Demo-Konto — die Angaben werden beim Neuladen der Seite gelöscht.',
        username: 'Benutzername',
        password: 'Passwort',
        profilePicture: 'Profilbild',
        createAccountButton: 'Konto erstellen',
        topFive: 'Die Top 5 heute',
        topFiveCartoons: 'Die Top 5 Cartoons heute',
        topFiveNote: 'Tägliche Auswahl aus beliebten Internet-Archive-Filmen, keine Live-Aufrufzahlen.',
        topFiveCartoonNote: 'Tägliche Auswahl aus der Internet-Archive-Cartoon-Sammlung.',
        allMovies: 'Alle Filme',
        cartoonMovies: 'Cartoon-Filme',
        allCartoons: 'Alle Cartoons',
        action: 'Action',
        fantasy: 'Fantasy',
        comedy: 'Komödie',
        adventure: 'Abenteuer',
        scifi: 'Science-Fiction',
        askAI: 'KI fragen',
        favorites: 'Favoriten',
        loading: 'Retromovies werden geladen ...'
    },
    es: {
        name: 'Español',
        searchPlaceholder: 'Buscar películas clásicas ...',
        login: 'Acceder',
        legal: 'Legal',
        createAccount: 'Crear cuenta',
        accountNote: 'Solo cuenta demo — los datos desaparecen al actualizar la página.',
        username: 'Nombre de usuario',
        password: 'Contraseña',
        profilePicture: 'Foto de perfil',
        createAccountButton: 'Crear cuenta',
        topFive: 'Top 5 de hoy',
        topFiveCartoons: 'Top 5 de dibujos hoy',
        topFiveNote: 'Selección diaria de películas populares de Internet Archive, sin cifras reales.',
        topFiveCartoonNote: 'Selección diaria de dibujos animados de Internet Archive.',
        allMovies: 'Todas las películas',
        cartoonMovies: 'Películas animadas',
        allCartoons: 'Todos los dibujos',
        action: 'Acción',
        fantasy: 'Fantasía',
        comedy: 'Comedia',
        adventure: 'Aventura',
        scifi: 'Ciencia ficción',
        askAI: 'Preguntar a IA',
        favorites: 'Favoritos',
        loading: 'Cargando películas clásicas ...'
    },
    fr: {
        name: 'Français',
        searchPlaceholder: 'Rechercher des films rétro ...',
        login: 'Connexion',
        legal: 'Mentions légales',
        createAccount: 'Créer un compte',
        accountNote: 'Compte de démonstration — les informations disparaissent lors du rechargement.',
        username: "Nom d'utilisateur",
        password: 'Mot de passe',
        profilePicture: 'Photo de profil',
        createAccountButton: 'Créer un compte',
        topFive: 'Top 5 du jour',
        topFiveCartoons: 'Top 5 dessins animés',
        topFiveNote: 'Sélection quotidienne de films populaires d’Internet Archive, pas de statistiques en direct.',
        topFiveCartoonNote: 'Sélection quotidienne de dessins animés d’Internet Archive.',
        allMovies: 'Tous les films',
        cartoonMovies: 'Films dessinés',
        allCartoons: 'Tous les dessins',
        action: 'Action',
        fantasy: 'Fantaisie',
        comedy: 'Comédie',
        adventure: 'Aventure',
        scifi: 'Science-fiction',
        askAI: 'Demander à IA',
        favorites: 'Favoris',
        loading: 'Chargement des films rétro ...'
    }
};

function setLanguage(language) {
    const strings = translations[language] || translations.en;

    document.documentElement.lang = language;
    languageLabel.textContent = strings.name;
    languageOptions.hidden = true;
    languageButton.setAttribute('aria-expanded', 'false');

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (strings[key]) {
            element.textContent = strings[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        if (strings[key]) {
            element.placeholder = strings[key];
            element.setAttribute('aria-label', strings[key]);
        }
    });

    if (document.getElementById('accountSignedIn').hidden) {
        document.getElementById('headerAccountName').textContent = strings.login;
    }

    const cartoonMode = document.body.classList.contains('cartoon-theme');
    document.getElementById('daily-top-title').textContent = cartoonMode ? strings.topFiveCartoons : strings.topFive;
    document.querySelector('.daily-top-note').textContent = cartoonMode ? strings.topFiveCartoonNote : strings.topFiveNote;

    const askAiText = document.querySelector('#assistantToggle span:last-child');
    if (askAiText) {
        askAiText.textContent = strings.askAI;
    }

    const legalText = document.querySelector('#legalOpen .menu-btn-text');
    if (legalText) {
        legalText.textContent = strings.legal;
    }
}

languageButton.addEventListener('click', () => {
    const isOpen = !languageOptions.hidden;
    languageOptions.hidden = isOpen;
    languageButton.setAttribute('aria-expanded', String(!isOpen));
});

languageOptions.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
});

document.addEventListener('click', event => {
    if (!event.target.closest('.language-menu')) {
        languageOptions.hidden = true;
        languageButton.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !languageOptions.hidden) {
        languageOptions.hidden = true;
        languageButton.setAttribute('aria-expanded', 'false');
        languageButton.focus();
    }
});
