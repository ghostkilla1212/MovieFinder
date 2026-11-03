const movies = [
      { title: "Rebecca (1940) - Alfred Hitchcock", year: "1940", videoId: "K5xOgZXjNZY" },
      { title: "The Cocoanuts (1929) - Marx Brothers", year: "1929", videoId: "HpDVpxL7PnA" },
      { title: "Night of the Living Dead (1968)", year: "1968", videoId: "H6Q9a215Rsc" },
      { title: "The Bat Whispers (1930)", year: "1930", videoId: "oIegUyJkwSs" },
      { title: "The Immigrant (1917) - Charlie Chaplin", year: "1917", videoId: "IVMjSQ33V_o" },
      { title: "Nothing Sacred (1937)", year: "1937", videoId: "NroKHDXLJoA" },
      { title: "Metropolis (1927) - Fritz Lang", year: "1927", videoId: "gdtZv3X8rZk" },
      { title: "Carnival of Souls (1962)", year: "1962", videoId: "E0_gGcl3V80" },
      { title: "Nosferatu (1922)", year: "1922", videoId: "FC6jFoYm3Xs" },
      { title: "Charade (1963) - Cary Grant", year: "1963", videoId: "9g20q2n88w8" },
      { title: "The General (1926) - Buster Keaton", year: "1926", videoId: "iHlBJ7MpM4A" },
      { title: "His Girl Friday (1940)", year: "1940", videoId: "rC_J-zW-JmE" },
      { title: "Plan 9 from Outer Space (1959)", year: "1959", videoId: "mN2TO8x-Nsc" }
    ];

    function renderMovies() {
      const container = document.getElementById('movie-container');
      container.innerHTML = '';

      movies.forEach(movie => {
        const card = document.createElement('article');
        card.className = 'movie-card';

        const posterUrl = `https://img.youtube.com/vi/${movie.videoId}/hqdefault.jpg`;

        card.innerHTML = `
          <div class="player-container" onclick="playVideo(this, '${movie.videoId}')">
            <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
            <div class="play-btn"></div>
          </div>
          <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-meta">Erscheinungsjahr: ${movie.year}</p>
          </div>
        `;

        container.appendChild(card);
      });
    }

    function playVideo(element, videoId) {
      element.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
          title="Video Player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    }

    renderMovies();