export function GameCard(games = null) {
  const defaultGames = [
    {
      id: 1,
      title: "The Legend of Zelda",
      price: 60,
      platform: "Nintendo Switch",
      category: "Aventura",
      image: "https://via.placeholder.com/300x400?text=Zelda",
    },
    {
      id: 2,
      title: "God of War: Ragnarok",
      price: 70,
      platform: "PlayStation 5",
      category: "Acción",
      image: "https://via.placeholder.com/300x400?text=God+of+War",
    },
    {
      id: 3,
      title: "Halo Infinite",
      price: 50,
      platform: "Xbox Series X",
      category: "Acción",
      image: "https://via.placeholder.com/300x400?text=Halo",
    },
    {
      id: 4,
      title: "Cyberpunk 2077",
      price: 60,
      platform: "PC (Steam)",
      category: "Simulación",
      image: "https://via.placeholder.com/300x400?text=Cyberpunk",
    },
    {
      id: 5,
      title: "FIFA 22",
      price: 55,
      platform: "PlayStation 4",
      category: "Deportes",
      image: "https://via.placeholder.com/300x400?text=FIFA",
    },
    {
      id: 6,
      title: "Super Mario Odyssey",
      price: 50,
      platform: "Nintendo Switch",
      category: "Aventura",
      image: "https://via.placeholder.com/300x400?text=Mario",
    },
    {
      id: 7,
      title: "The Sims 4",
      price: 40,
      platform: "PC (Origin)",
      category: "Simulación",
      image: "https://via.placeholder.com/300x400?text=The+Sims",
    },
    {
      id: 8,
      title: "Rocket League",
      price: 20,
      platform: "PC (Epic Games)",
      category: "Deportes",
      image: "https://via.placeholder.com/300x400?text=Rocket+League",
    },
  ];

  const renderGames = games || defaultGames;

  // Renderizar las tarjetas de juegos
  return renderGames
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
          <p class="card-text">Plataforma: ${game.platform}</p>
          <p class="card-text">Categoría: ${game.category}</p>
          <button
            class="btn btn-sm btn-outline-primary"
            data-bs-toggle="modal"
            data-bs-target="#editGameModal"
          >
            Editar
          </button>
          <button
            class="btn btn-sm btn-outline-danger"
            data-bs-toggle="modal"
            data-bs-target="#deleteGameModal"
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

/* 
export function GameCard(game) {
  return `
    <div class="col">
      <div class="card h-100 shadow-sm">
        <img
          src="${
            game.image || "https://via.placeholder.com/300x400?text=Juego"
          }"
          class="card-img-top"
          alt="${game.title}"
        />
        <div class="card-body text-center">
          <h5 class="card-title text-primary">${game.title}</h5>
          <p class="card-text">Precio: $${game.price}</p>
          <p class="card-text">Plataforma: ${game.platform}</p>
          <button class="btn btn-sm btn-outline-primary" onclick="editGame(${
            game.id
          })">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteGame(${
            game.id
          })">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}
*/
