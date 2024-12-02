// store.js

import { getGames, getCategories } from "../services/gameService.js";
// import { getUserLibrary } from "../services/userService.js"; // Comentado para evitar conflicto

document.addEventListener("DOMContentLoaded", async () => {
  const gameGrid = document.getElementById("gameGrid");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const paginationContainer = document.getElementById("pagination");

  let games = [];
  let filteredGames = [];
  let ownedGameIds = [];
  let currentPage = 1;
  const gamesPerPage = 8; // Puedes ajustar este valor

  try {
    // Obtener juegos y categorías
    const [gamesData, categories] = await Promise.all([
      getGames(),
      getCategories(),
    ]);
    games = gamesData;
    filteredGames = games; // Inicialmente, no hay filtros aplicados

    // Obtener la biblioteca del usuario
    ownedGameIds = await getUserLibrary();

    // Renderizar categorías
    categoryFilter.innerHTML = `
      <li><a class="dropdown-item category-item" href="#" data-category="all">Todas las categorías</a></li>
      ${categories
        .map(
          (category) =>
            `<li><a class="dropdown-item category-item" href="#" data-category="${category}">${category}</a></li>`
        )
        .join("")}
    `;

    // Mostrar todos los juegos por defecto
    renderGames();
    renderPagination();

    // Filtro por categoría
    categoryFilter.addEventListener("click", (event) => {
      event.preventDefault();
      const target = event.target;
      if (!target.classList.contains("category-item")) return;
      const category = target.getAttribute("data-category");
      if (!category) return;

      if (category === "all") {
        filteredGames = games;
      } else {
        filteredGames = games.filter((game) =>
          game.category.includes(category)
        );
      }
      currentPage = 1; // Reiniciar a la primera página
      renderGames();
      renderPagination();
    });

    // Búsqueda
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (searchTerm === "") {
        filteredGames = games;
      } else {
        filteredGames = games.filter((game) =>
          game.title.toLowerCase().includes(searchTerm)
        );
      }
      currentPage = 1; // Reiniciar a la primera página
      renderGames();
      renderPagination();
    });

    // Manejar clic en los botones de paginación
    paginationContainer.addEventListener("click", (event) => {
      const target = event.target;
      if (target.tagName === "BUTTON") {
        const page = parseInt(target.textContent);
        if (!isNaN(page)) {
          currentPage = page;
          renderGames();
          renderPagination();
          window.scrollTo(0, 0); // Opcional: Volver al inicio al cambiar de página
        }
      }
    });

    // Aquí puedes agregar los event listeners para los botones de compra si es necesario
  } catch (error) {
    console.error(
      "Error al cargar los juegos, categorías o biblioteca del usuario:",
      error
    );
    alert("Error al cargar la tienda. Por favor, recarga la página.");
  }

  // Función para renderizar los juegos de la página actual
  function renderGames() {
    // Calcular los índices de los juegos a mostrar
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToDisplay = filteredGames.slice(startIndex, endIndex);

    gameGrid.innerHTML = gamesToDisplay
      .map((game) => {
        const gameId = game._id.toString();
        const isOwned = ownedGameIds.includes(gameId);
        console.log(`Juego: ${game.title}, ID: ${gameId}, Poseído: ${isOwned}`);
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
  }

  // Función para renderizar los botones de paginación
  function renderPagination() {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.className = "btn btn-outline-primary mx-1";
      button.textContent = i;

      if (i === currentPage) {
        button.classList.add("active");
      }

      paginationContainer.appendChild(button);
    }
  }

  // Función para obtener la biblioteca del usuario
  async function getUserLibrary() {
    try {
      const response = await fetch("/api/user/library", {
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
});
