// src/components/GameCardStore.js

export async function fetchGames() {
  try {
    const response = await fetch("http://localhost:3000/api/games");

    if (!response.ok) {
      throw new Error("Error al obtener los juegos");
    }
    const games = await response.json();
    return games;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

export function GameCardStore(games = [], ownedGameIds = []) {
  // Aseguramos que ownedGameIds es un arreglo de cadenas
  const ownedGameIdsString = ownedGameIds.map(id => id.toString());

  return games
    .map((game) => {
      const gameIdString = game._id.toString(); // Convertimos el ID del juego a cadena
      const isOwned = ownedGameIdsString.includes(gameIdString); // Comparamos las cadenas

      return `
        <div class="col">
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
              ${
                isOwned
                  ? '<span class="badge bg-success">Comprado</span>'
                  : `<button
                      class="btn comprar-btn"
                      data-title="${game.title}"
                      data-price="${game.price}"
                      data-price-id="${game.priceId}"
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
