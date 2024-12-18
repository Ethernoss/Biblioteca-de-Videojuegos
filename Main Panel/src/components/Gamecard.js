export async function fetchGames() {
  try {
    const response = await fetch("/api/games"); // Endpoint correcto
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

export function GameCard(games = []) {
  // Renderizar las tarjetas de juegos
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
          <p class="card-text">Descripción: ${game.description}</p>
          <p class="card-text">Categoría: ${game.category}</p>
          <button
            class="btn btn-sm btn-outline-primary edit-game-btn"
            data-id="${game._id}"
            data-bs-toggle="modal"
            data-bs-target="#editGameModal"
          >
            Editar
          </button>
          <button
            class="btn btn-sm btn-outline-danger delete-game-btn"
            data-id="${game._id}"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}
