import { getGames, getCategories } from "../services/gameService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const gameGrid = document.getElementById("gameGrid");
  const categoryFilter = document.getElementById("categoryFilter");

  try {
    // Obtener juegos y categorías desde el servicio
    const [games, categories] = await Promise.all([getGames(), getCategories()]);

    // Renderizar juegos
    const renderGames = (filteredGames) => {
      gameGrid.innerHTML = filteredGames
        .map(
          (game) => `
        <div class="col">
          <div class="card h-100 bg-dark text-white">
            <img src="${game.image}" class="card-img-top" alt="${game.title}" />
            <div class="card-body">
              <h5 class="card-title">${game.title}</h5>
              <p class="card-text">${game.description}</p>
              <p class="card-text">$${game.price}</p>
              <button
                class="btn btn-primary comprar-btn"
                data-title="${game.title}"
                data-price="${game.price}"
                data-price-id="${game.priceId}"
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      `
        )
        .join("");
    };

    // Renderizar todas las categorías en el menú desplegable
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

    // Filtrar juegos por categoría al hacer clic en el menú
    categoryFilter.addEventListener("click", (event) => {
      event.preventDefault();
      const category = event.target.getAttribute("data-category");
      if (!category) return;

      if (category === "all") {
        renderGames(games); // Muestra todos los juegos
      } else {
        const filteredGames = games.filter((game) =>
          game.category.includes(category)
        );
        renderGames(filteredGames);
      }
    });
  } catch (error) {
    console.error("Error al cargar los juegos o categorías:", error);
  }
});
