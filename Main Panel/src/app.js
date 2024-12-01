import { Dashboard } from "./pages/dashboard.js";
import { GameCard } from "./components/Gamecard.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado correctamente");

  // -------------------------
  // VARIABLES Y ELEMENTOS
  // -------------------------

  // Elementos del DOM
  const searchInput = document.querySelector(".inputbox input"); // Input de búsqueda
  const gamesContainer = document.querySelector(".row"); // Contenedor de las tarjetas (admin)
  const gamesGrid = document.getElementById("gamesGrid"); // Contenedor de las tarjetas (library)
  const categoryList = document.querySelector("#categoryList"); // Lista de categorías (library)

  // Lista de categorías predefinidas
  const categories = [
    "All",
    "Action",
    "Adventure",
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

  // -------------------------
  // FUNCIONES
  // -------------------------

  // Cargar todos los juegos al inicio
  const loadAllGames = async () => {
    try {
      const response = await fetch("/api/games/games");
      if (!response.ok) throw new Error("Error al cargar los juegos");

      const games = await response.json();

      if (window.location.pathname.includes("admin.html")) {
        gamesContainer.innerHTML = GameCard(games);
      } else if (window.location.pathname.includes("biblioteca.html")) {
        gamesGrid.innerHTML = GameCard(games);
      }
    } catch (error) {
      console.error("Error al cargar los juegos:", error.message);
    }
  };

  // Filtrar juegos por categoría
  const filterByCategory = async (category) => {
    try {
      const response = await fetch("/api/games/gamesCategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [category] }),
      });

      const games = await response.json();

      // Renderizar en el contenedor correcto según la página
      if (window.location.pathname.includes("admin.html")) {
        gamesContainer.innerHTML = GameCard(games); // Renderiza los juegos en admin.html
      } else if (window.location.pathname.includes("biblioteca.html")) {
        gamesGrid.innerHTML = GameCard(games); // Renderiza los juegos en biblioteca.html
      }
    } catch (error) {
      console.error("Error al filtrar por categoría:", error.message);

      // Mostrar un mensaje de error en el contenedor correspondiente
      if (window.location.pathname.includes("admin.html")) {
        gamesContainer.innerHTML =
          "<p class='text-center text-danger'>Error al filtrar los juegos.</p>";
      } else if (window.location.pathname.includes("biblioteca.html")) {
        gamesGrid.innerHTML =
          "<p class='text-center text-danger'>Error al filtrar los juegos.</p>";
      }
    }
  };

  // Manejar búsqueda global
  const handleSearch = async (query) => {
    try {
      const response = await fetch(`/api/games/search?q=${query}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Error al buscar juegos.");
        gamesContainer.innerHTML =
          "<p class='text-center'>No se encontraron resultados.</p>";
        return;
      }
      const games = await response.json();
      console.log("Resultados de búsqueda:", games);
      gamesContainer.innerHTML = GameCard(games); // Renderiza los resultados de búsqueda
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error.message);
    }
  };

  // Manejar búsqueda en biblioteca.html
  const handleLibrarySearch = async (query) => {
    try {
      const response = await fetch(`/api/games/library/search?q=${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.error("Error al buscar juegos en la biblioteca.");
        gamesGrid.innerHTML =
          "<p class='text-center text-danger'>No se encontraron resultados.</p>";
        return;
      }

      const games = await response.json();
      console.log("Resultados de búsqueda en la biblioteca:", games);

      // Renderizar los resultados de búsqueda en el contenedor de la biblioteca
      gamesGrid.innerHTML = GameCard(games);
    } catch (error) {
      console.error(
        "Error al realizar la búsqueda en la biblioteca:",
        error.message
      );
    }
  };

  // Manejar formulario para agregar juegos
  const handleAddGame = async (event) => {
    event.preventDefault(); // Evitar recargar la página

    const newGame = {
      title: document.getElementById("gameTitle").value,
      price: parseFloat(document.getElementById("gamePrice").value),
      description: document.getElementById("gameDescription").value,
      category: document
        .getElementById("gameCategory")
        .value.split(",")
        .map((cat) => cat.trim()), // Convertir categorías a un arreglo
      image: document.getElementById("gameImage").value,
    };

    console.log("Datos enviados al backend:", newGame);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGame),
      });

      if (response.ok) {
        console.log("Juego agregado correctamente");
        const result = await response.json();
        console.log("Respuesta del servidor:", result);

        await Dashboard(); // Actualizar el Dashboard
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addGameModal")
        );
        modal.hide(); // Cerrar el modal
        addGameForm.reset(); // Reiniciar el formulario
      } else {
        console.error("Error al agregar el juego");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  // Manejar formulario para editar juegos
  const handleEditGame = async (event) => {
    event.preventDefault();

    const gameId = editGameForm.dataset.id; // Obtener el ID como cadena
    const updatedGame = {
      title: document.getElementById("editGameTitle").value,
      price: parseFloat(document.getElementById("editGamePrice").value),
      description: document.getElementById("editGameDescription").value,
      category: document
        .getElementById("editGameCategory")
        .value.split(",")
        .map((cat) => cat.trim()),
      image: document.getElementById("editGameImage").value,
    };

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGame),
      });

      if (response.ok) {
        console.log("Juego actualizado correctamente");
        await Dashboard(); // Actualizar la vista del Dashboard
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editGameModal")
        );
        modal.hide(); // Cerrar el modal
      } else {
        console.error("Error al actualizar el juego");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error.message);
    }
  };

  // Detectar clic en botones de edición y eliminación
  const handleGameActions = async (event) => {
    if (event.target.classList.contains("edit-game-btn")) {
      // Manejar la edición de un juego
      const gameId = event.target.dataset.id;

      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          throw new Error("Error al obtener el juego desde la API");
        }

        const game = await response.json();

        // Llenar los campos del modal con los datos obtenidos
        document.getElementById("editGameTitle").value = game.title;
        document.getElementById("editGamePrice").value = game.price;
        document.getElementById("editGameCategory").value =
          game.category.join(", "); // Convertir array a string
        document.getElementById("editGameDescription").value = game.description;
        document.getElementById("editGameImage").value = game.image;

        // Guardar el ID del juego en el dataset del formulario
        const editGameForm = document.getElementById("editGameForm");
        editGameForm.dataset.id = gameId;
      } catch (error) {
        console.error("Error al cargar los datos del juego:", error.message);
      }
    } else if (event.target.classList.contains("delete-game-btn")) {
      // Manejar la eliminación de un juego
      const gameId = event.target.dataset.id;
      if (confirm("¿Estás seguro de eliminar este juego?")) {
        try {
          const response = await fetch(`/api/games/${gameId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            console.log("Juego eliminado correctamente");
            await Dashboard(); // Actualizar la vista del Dashboard
          } else {
            console.error("Error al eliminar el juego");
          }
        } catch (error) {
          console.error(
            "Error al enviar la solicitud de eliminación:",
            error.message
          );
        }
      }
    }
  };

  // -------------------------
  // EVENTOS
  // -------------------------

  // Renderizar lista de categorías
  if (categoryList) {
    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.className = "category-item";
      listItem.textContent = category;
      listItem.addEventListener("click", () => filterByCategory(category));
      categoryList.appendChild(listItem);
    });
  }

  // Manejar eventos del input de búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", async () => {
      const query = searchInput.value.trim();
      if (query === "") {
        loadAllGames(); // Si el input está vacío, cargar todos los juegos
        return;
      }
      await handleSearch(query);
    });
  }

  // Cargar todos los juegos al inicio
  if (gamesGrid) {
    loadAllGames();
  }

  // Manejar eventos de edición y eliminación
  if (gamesContainer) {
    gamesContainer.addEventListener("click", handleGameActions);
  }

  // Manejar formulario de agregar juegos
  const addGameForm = document.getElementById("addGameForm");
  if (addGameForm) {
    addGameForm.addEventListener("submit", handleAddGame);
  }

  // Manejar formulario de editar juegos
  const editGameForm = document.getElementById("editGameForm");
  if (editGameForm) {
    editGameForm.addEventListener("submit", handleEditGame);
  }
});
