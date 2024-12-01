// store.js

import { getGames, getCategories } from "../services/gameService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const gameGrid = document.getElementById("gameGrid");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");

  let games = [];
  let ownedGameIds = [];

  try {
    // Obtener juegos y categorías
    const [gamesData, categories] = await Promise.all([
      getGames(),
      getCategories(),
    ]);
    games = gamesData;

    // Obtener la biblioteca del usuario
    ownedGameIds = await getUserLibrary();

    // Función para renderizar los juegos
    const renderGames = (filteredGames) => {
      gameGrid.innerHTML = filteredGames
        .map((game) => {
          const gameId = game._id.toString();
          const isOwned = ownedGameIds.includes(gameId);
          console.log(`Juego: ${game.title}, ID: ${gameId}, Poseído: ${isOwned}`); // Agrega este console.log
          return `
            <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
              <div class="card h-100 bg-dark text-white">
                <img src="${game.image}" class="card-img-top" alt="${game.title}" />
                <div class="card-body text-center">
                  <h5 class="card-title">${game.title}</h5>
                  <p class="card-text">${game.description}</p>
                  <p class="card-text">$${game.price}</p>
                  ${
                    isOwned
                      ? '<span class="badge bg-success">Comprado</span>'
                      : `<button
                          class="btn btn-primary comprar-btn"
                          data-title="${game.title}"
                          data-price="${game.price}"
                          data-game-id="${game._id}"
                        >
                          Comprar
                        </button>`
                  }
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    };
    

    // Renderizar categorías
    categoryFilter.innerHTML = `
      <li><a class="dropdown-item" href="#" data-category="all">Todas las categorías</a></li>
      ${categories
        .map(
          (category) =>
            `<li><a class="dropdown-item" href="#" data-category="${category}">${category}</a></li>`
        )
        .join("")}
    `;

    // Mostrar todos los juegos por defecto
    renderGames(games);

    // Filtro por categoría
    categoryFilter.addEventListener("click", (event) => {
      event.preventDefault();
      const category = event.target.getAttribute("data-category");
      if (!category) return;

      if (category === "all") {
        renderGames(games);
      } else {
        const filteredGames = games.filter((game) =>
          game.category.includes(category)
        );
        renderGames(filteredGames);
      }
    });

    // Búsqueda
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();

      const filteredGames = games.filter((game) =>
        game.title.toLowerCase().includes(searchTerm)
      );

      renderGames(filteredGames);
    });

    // Aquí puedes agregar los event listeners para los botones de compra si es necesario

  } catch (error) {
    console.error(
      "Error al cargar los juegos, categorías o biblioteca del usuario:",
      error
    );
    alert("Error al cargar la tienda. Por favor, recarga la página.");
  }
});

// Función para obtener la biblioteca del usuario
async function getUserLibrary() {
  try {
    const response = await fetch("http://localhost:3000/api/user/library", {
      credentials: "include", // Importante para enviar las cookies de autenticación
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Usuario no autenticado, redirigir al inicio de sesión
        window.location.href = "/login";
      }
      throw new Error("Error al obtener la biblioteca del usuario");
    }

    const data = await response.json();
    const ownedGameIds = data.games; // Suponiendo que data.games es un arreglo de IDs
    return ownedGameIds;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}
