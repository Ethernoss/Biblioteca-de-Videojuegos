import { Dashboard } from "./pages/dashboard.js";
import { GameCard } from "./components/Gamecard.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado correctamente");
  Dashboard("All", 1); // Página inicial 1

  // -------------------------
  // VARIABLES Y ELEMENTOS
  // -------------------------

  // Elementos del DOM
  const searchInput = document.querySelector(".inputbox input"); // Input de búsqueda
  const gamesContainer = document.querySelector(".row"); // Contenedor de las tarjetas (admin)
  const categoryList = document.querySelector("#categoryList"); // Lista de categorías

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
      const response = await fetch("/api/games");
      if (!response.ok) throw new Error("Error al cargar los juegos");

      const games = await response.json();
      gamesContainer.innerHTML = GameCard(games); // Renderiza los juegos
    } catch (error) {
      console.error("Error al cargar los juegos:", error.message);
      gamesContainer.innerHTML =
        "<p class='text-center text-danger'>Error al cargar los juegos.</p>";
    }
  };

  // Paginación
  const renderPagination = (totalPages, currentPage) => {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Limpiar botones previos

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.className = "btn btn-outline-primary mx-1";
      button.textContent = i;

      if (i === currentPage) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => Dashboard(undefined, i)); // Actualizar al cambiar página
      paginationContainer.appendChild(button);
    }
  };

  // Filtrar juegos por categoría
  const filterByCategory = async (category) => {
    try {
      let games;
      if (category === "All") {
        // Cargar todos los juegos si la categoría es "All"
        const response = await fetch("/api/games");
        if (!response.ok) throw new Error("Error al cargar los juegos");
        games = await response.json();
      } else {
        // Filtrar por categoría específica
        const response = await fetch("/api/gamesCategories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: [category] }),
        });

        if (!response.ok) throw new Error("Error al filtrar juegos");
        games = await response.json();
      }

      // Asegurar la paginación
      const itemsPerPage = 8; // Juegos por página
      const totalPages = Math.ceil(games.length / itemsPerPage);

      // Mostrar solo la primera página por defecto
      const paginatedGames = games.slice(0, itemsPerPage);
      gamesContainer.innerHTML = GameCard(paginatedGames);

      renderPagination(totalPages, 1, category); // Renderizar botones de paginación
    } catch (error) {
      console.error("Error al filtrar por categoría:", error.message);

      gamesContainer.innerHTML =
        "<p class='text-center text-danger'>Error al filtrar los juegos.</p>";
    }
  };

  // Manejar búsqueda global
  const handleSearch = async (query) => {
    try {
      const response = await fetch(`/api/search?q=${query}`, {
        method: "GET",
        //credentials: "include",
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

      // Reiniciar la paginación después de buscar
      const totalPages = Math.ceil(games.length / 8); // Calcular total de páginas
      renderPagination(totalPages, 1);
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error.message);
    }
  };

  // Manejar formulario para agregar juegos
  const handleAddGame = async (event) => {
    event.preventDefault(); // Evitar recargar la página

    const addGameForm = document.getElementById("addGameForm");
    const formData = new FormData(addGameForm); // Crear un FormData con los datos del formulario

    // Verificar qué datos se envían
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch("/api/games/", {
        method: "POST",
        body: formData, // Enviar los datos como FormData
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
      console.error("Error al enviar la solicitud:", error.message);
    }
  };

  // Manejar formulario para editar juegos
  const handleEditGame = async (event) => {
    event.preventDefault(); // Evitar recargar la página

    const editGameForm = document.getElementById("editGameForm");
    const formData = new FormData(editGameForm); // Crear un FormData con los datos del formulario

    const gameId = editGameForm.dataset.id; // Obtener el ID del juego desde el dataset del formulario

    // Debug para verificar los datos enviados
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        body: formData, // Enviar los datos como FormData
      });

      if (response.ok) {
        console.log("Juego actualizado correctamente");
        const result = await response.json();
        console.log("Respuesta del servidor:", result);

        await Dashboard(); // Actualizar la vista del Dashboard
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editGameModal")
        );
        modal.hide(); // Cerrar el modal
        editGameForm.reset(); // Reiniciar el formulario
      } else {
        console.error("Error al actualizar el juego");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error.message);
    }
  };

  // Manejar acciones y eliminación de juegos
  const handleGameActions = async (event) => {
    const target = event.target;

    if (target.classList.contains("edit-game-btn")) {
      // Manejar la edición de un juego
      const gameId = target.dataset.id;

      try {
        const response = await fetch(`/api/games/${gameId}`); // Cambiar ruta si es necesario
        if (!response.ok) {
          throw new Error("Error al obtener el juego desde la API");
        }

        const game = await response.json();
        console.log("Datos del juego cargados:", game); // Depuración

        // Precargar los campos del modal
        document.getElementById("editGameTitle").value = game.title;
        document.getElementById("editGamePrice").value = game.price;
        document.getElementById("editGameCategory").value =
          game.category.join(", ");
        document.getElementById("editGameDescription").value = game.description;

        // Guardar el ID del juego en el dataset del formulario
        const editGameForm = document.getElementById("editGameForm");
        editGameForm.dataset.id = game._id;
      } catch (error) {
        console.error("Error al cargar los datos del juego:", error.message);
      }
    } else if (target.classList.contains("delete-game-btn")) {
      // Abrir el modal de confirmación para eliminar
      const gameId = target.dataset.id;

      // Guardar el ID en una variable temporal
      const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
      confirmDeleteBtn.dataset.id = gameId;

      // Mostrar el modal de confirmación
      const deleteModal = new bootstrap.Modal(
        document.getElementById("deleteGameModal")
      );
      deleteModal.show();
    }
  };

  // Manejar eliminación de juegos
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  confirmDeleteBtn.addEventListener("click", async () => {
    const gameId = confirmDeleteBtn.dataset.id; // Obtener el ID del juego desde el botón

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

    // Cerrar el modal después de eliminar
    const deleteModal = bootstrap.Modal.getInstance(
      document.getElementById("deleteGameModal")
    );
    deleteModal.hide();
  });

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

// const handleAddGame = async (event) => {
//   event.preventDefault(); // Evitar recargar la página

//   const newGame = {
//     title: document.getElementById("gameTitle").value,
//     price: parseFloat(document.getElementById("gamePrice").value),
//     description: document.getElementById("gameDescription").value,
//     category: document
//       .getElementById("gameCategory")
//       .value.split(",")
//       .map((cat) => cat.trim()), // Convertir categorías a un arreglo
//     image: document.getElementById("gameImage").value,
//   };

//   console.log("Datos enviados al backend:", newGame);

//   try {
//     const response = await fetch("/api/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(newGame),
//     });

//     if (response.ok) {
//       console.log("Juego agregado correctamente");
//       const result = await response.json();
//       console.log("Respuesta del servidor:", result);

//       await Dashboard(); // Actualizar el Dashboard
//       const modal = bootstrap.Modal.getInstance(
//         document.getElementById("addGameModal")
//       );
//       modal.hide(); // Cerrar el modal
//       addGameForm.reset(); // Reiniciar el formulario
//     } else {
//       console.error("Error al agregar el juego");
//     }
//   } catch (error) {
//     console.error("Error al enviar la solicitud:", error);
//   }
// };
