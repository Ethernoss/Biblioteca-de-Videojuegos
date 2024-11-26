export async function fetchGames() {
  try {
    const response = await fetch("http://localhost:3000/api/games");

    if (!response.ok) {
      throw new Error("Error al obtener los juegos");
    }
    const games = await response.json();
    return games; // Devuelve los juegos
  } catch (error) {
    console.error(error.message);
    return []; // En caso de error, retorna un arreglo vacío
  }
}

export function GameCardStore(games = []) {
  return games
    .map(
      (game) => `
      <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
        <div class="card h-100 shadow-sm">
          <img
            src="${game.image}"
            class="card-img-top"
            alt="${game.title}"
          />
          <div class="card-body text-center">
            <h5 class="card-title text-primary">${game.title}</h5>
            <p class="card-text">Precio: $${game.price}</p>
            <p class="card-text">${game.description}</p>
            <p class="card-text">Categorías: ${game.category.join(", ")}</p>
            <button
              class="btn comprar-btn"
              data-title="${game.title}"
              data-price="${game.price}"
              data-price-id="${game.priceId}" // Usando el Price ID
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}