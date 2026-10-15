// 1. Suchwort aus der Webadresse holen
const urlParameter = new URLSearchParams(window.location.search);
const mySearchTerm = urlParameter.get('query');

// 2. Den Container für die Karten auf der Seite finden
const container = document.querySelector('.cards-container');

// Nur suchen, wenn der User wirklich ein Wort eingegeben hat
if (mySearchTerm) {
    
    // HIER IST DIE KORREKTE ADRESSE MIT DEM DOLLARZEICHEN:
    // Add the '$' for interpolation and ensure the API path is correct
fetch(`https://api.tvmaze.com/search/shows?q=${mySearchTerm}`)
        .then(response => response.json()) // Antwort in lesbaren Text umwandeln
        .then(data => {
            container.innerHTML = ""; // Container einmal leeren

            // 3. Das Fließband erstellt für jeden Film eine Karte
            data.forEach(item => {
                const show = item.show;
                
                // Sicherheitsnetz, falls eine Serie mal kein Poster hat
                const posterUrl = show.image ? show.image.medium : 'https://placehold.co';

                // 4. Deine HTML-Vorlage mit dem Bild befüllen
                container.innerHTML += `
                    <div class="cards">
                        <img class="movie-poster" src="${posterUrl}" alt="${show.name}">
                    </div>
                `;
            });
        })
        .catch(error => console.error("Fehler beim Laden:", error));
        
} else {
    if (container) {
        container.innerHTML = "<p>error</p>";
    }
}
