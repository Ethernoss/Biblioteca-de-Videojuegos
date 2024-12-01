const gamesGrid = document.getElementById("gamesGrid");
const categoryDropdown = document.getElementById("categoryDropdown");
const sidebarCategories = document.querySelectorAll(".sidebar .nav-link");

// Función para cargar todos los juegos
const loadAllGames = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/games"); // Endpoint para obtener todos los juegos
    if (!response.ok) throw new Error("Error al obtener los juegos");

    const games = await response.json();
    gamesGrid.innerHTML = ""; // Limpiar la grilla

    // Inserta los juegos en la grilla
    games.forEach(game => {
      const gameCard = `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div class="card text-dark">
            <img src="${game.image}" class="card-img-top" alt="${game.title}">
            <div class="card-body">
              <h6 class="card-title text-center">${game.title}</h6>
              <div class="d-grid mt-3">
                <button class="btn btn-primary btn-sm">Play</button>
              </div>
            </div>
          </div>
        </div>
      `;
      gamesGrid.innerHTML += gameCard;
    });
  } catch (error) {
    console.error("Error al cargar los juegos:", error.message);
    gamesGrid.innerHTML =
      "<p class='text-center text-danger'>Error al cargar los juegos.</p>";
  }
};

// Función para filtrar juegos por categoría
const filterGamesByCategory = async (selectedCategory) => {
  gamesGrid.innerHTML = ""; // Limpia la grilla de juegos

  if (selectedCategory) {
    console.log("Categoría seleccionada:", selectedCategory);
    try {
      const response = await fetch(
        "http://localhost:3000/api/gamesCategories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: [selectedCategory] }),
        }
      );

      if (!response.ok) throw new Error("Error al obtener los juegos");

      const games = await response.json();

      // Inserta los juegos en el HTML
      games.forEach((game) => {
        const gameCard = `
          <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card text-dark">
              <img src="${game.image}" class="card-img-top" alt="${game.title}">
              <div class="card-body">
                <h6 class="card-title text-center">${game.title}</h6>
                <div class="d-grid mt-3">
                  <button class="btn btn-primary btn-sm">Play</button>
                </div>
              </div>
            </div>
          </div>
        `;
        gamesGrid.innerHTML += gameCard;
      });
    } catch (error) {
      console.error("Error al cargar los juegos:", error.message);
      gamesGrid.innerHTML =
        "<p class='text-center text-danger'>Error al cargar los juegos.</p>";
    }
  }
};

// Evento al cargar la página
window.addEventListener("load", loadAllGames);

// Evento para el cambio de categoría
categoryDropdown.addEventListener("click", (event) => {
    const target = event.target;
    if (target.tagName === "A") {
      const selectedCategory = target.textContent.trim(); // Obtener la categoría seleccionada
      console.log("Categoría seleccionada:", selectedCategory);
      filterGamesByCategory(selectedCategory);
    }
  });

  sidebarCategories.forEach((category) => {
    category.addEventListener("click", (event) => {
      event.preventDefault(); // Evita que se recargue la página
      const selectedCategory = event.target.textContent.trim();
      console.log("Categoría seleccionada desde la barra lateral:", selectedCategory);
      filterGamesByCategory(selectedCategory);
    });
  });
