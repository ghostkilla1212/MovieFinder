
const popularShows = document.querySelector(".popular-shows");

const showNames = ["The Last of Us", "Wednesday", "The Witcher", "Stranger Things", "Joker", "Home Alone"];

showNames.forEach((showName) => {
    const card = document.createElement("article");
    card.classList.add("show-card");

    const title = document.createElement("h2");
    title.textContent = showName;
    card.appendChild(title);
    popularShows.appendChild(card);

    fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(showName)}`)
        .then(response => response.json())
        .then(show => {
            if (show.image) {
                const image = document.createElement("img");

                image.src = show.image.medium;
                image.alt = show.name;
                image.classList.add("show-poster");

                card.prepend(image);
            }
        })
        .catch(error => console.error("Fehler beim Laden:", error));
});
