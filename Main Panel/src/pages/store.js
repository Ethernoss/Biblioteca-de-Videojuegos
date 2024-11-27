import { getGames, getCategories } from "../services/gameService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const gameGrid = document.getElementById("gameGrid");
  const categoryFilter = document.getElementById("categoryFilter");

  try {
    // Obtener juegos y categorías desde el servicio
    const [games, categories] = await Promise.all([getGames(), getCategories()]);

    // Función para renderizar los juegos
    const renderGames = (filteredGames) => {
      gameGrid.innerHTML = filteredGames
        .map(
          (game) => `
        <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
          <div class="card h-100 bg-dark text-white">
            <img src="${game.image}" class="card-img-top" alt="${game.title}" />
            <div class="card-body text-center">
              <h5 class="card-title">${game.title}</h5>
              <p class="card-text">${game.description}</p>
              <p class="card-text">$${game.price}</p>
              <button
                class="btn btn-primary comprar-btn"
                data-title="${game.title}"
                data-price="${game.price}"
                data-price-id="${game.priceId}"
                data-game-id="${game._id}"
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

    // Manejo del clic en el filtro de categorías
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

    // No manejes el evento "Comprar" aquí
    // Deja que stripeService.js se encargue de eso
  } catch (error) {
    console.error("Error al cargar los juegos o categorías:", error);
    alert("Error al cargar la tienda. Por favor, recarga la página.");
  }
});
