import { Header } from "./components/header.js";
import { Dashboard } from "./pages/Dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado correctamente");

  // Renderizar el Dashboard
  Dashboard();

  // Inicializar categorías
  const categories = [
    "Action",
    "Adventura",
    "RPG",
    "Shooter",
    "Strategy",
    "Simulation",
    "Sports",
    "Racing",
    "Puzzle",
    "Plataformer",
    "Fighting",
    "Horror",
    "Survival",
    "MMO",
    "Indie",
  ];

  const categoryList = document.querySelector("#categoryList");
  if (categoryList) {
    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.className = "category-item";
      listItem.textContent = category;
      listItem.addEventListener("click", () => {
        console.log(`Filtrando por categoría: ${category}`);
        // Actualizar los juegos según la categoría seleccionada
        const filteredGames = games.filter(
          (game) => game.category === category
        );
        const gameContainer = document.querySelector(".row");
        gameContainer.innerHTML = GameCard(filteredGames);
      });
      categoryList.appendChild(listItem);
    });
  }

  // Manejar el formulario de agregar juegos
  const addGameForm = document.getElementById("addGameForm");
  if (addGameForm) {
    addGameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newGame = {
        title: document.getElementById("gameTitle").value,
        price: parseFloat(document.getElementById("gamePrice").value),
        platform: document.getElementById("gamePlatform").value,
      };

      console.log("Juego agregado:", newGame); // Simulación por ahora
      addGameForm.reset();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addGameModal")
      );
      modal.hide();
    });
  }

  // Manejar el formulario de ordenar juegos
  const sortGamesForm = document.getElementById("sortGamesForm");
  if (sortGamesForm) {
    sortGamesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const sortOption = document.getElementById("sortOption").value;
      console.log("Ordenar por:", sortOption); // Simulación por ahora
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("sortGamesModal")
      );
      modal.hide();
    });
  }

  // Manejar el formulario de modificar juegos
  const editGameForm = document.getElementById("editGameForm");
  editGameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedGame = {
      title: document.getElementById("editGameTitle").value,
      price: parseFloat(document.getElementById("editGamePrice").value),
      platform: document.getElementById("editGamePlatform").value,
    };

    console.log("Juego modificado:", updatedGame); // Simulación por ahora
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editGameModal")
    );
    modal.hide();
  });

  // Manejar la confirmación de eliminación
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  confirmDeleteBtn.addEventListener("click", () => {
    console.log("Juego eliminado"); // Simulación por ahora
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteGameModal")
    );
    modal.hide();
  });
});

/*  
document.getElementById("backDashboardBtn").addEventListener("click", () => {
    alert("Regresar al dashboard");
  }); 
  */
