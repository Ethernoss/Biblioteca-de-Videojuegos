import { Dashboard } from "./pages/Dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado correctamente");

  // Inicializar categorías
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

  // Renderizar lista de categorías
  const categoryList = document.querySelector("#categoryList");
  if (categoryList) {
    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.className = "category-item";
      listItem.textContent = category;
      listItem.addEventListener("click", () => {
        Dashboard(category); // Filtrar juegos por categoría
      });
      categoryList.appendChild(listItem);
    });
  }

  // Manejar formulario para agregar juegos

  console.log("DOM cargado correctamente");

  // Manejar formulario para agregar juegos
  const addGameForm = document.getElementById("addGameForm");

  addGameForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitar recargar la página

    const newGame = {
      title: document.getElementById("gameTitle").value,
      price: parseFloat(document.getElementById("gamePrice").value),
      platform: document.getElementById("gamePlatform").value,
      category: document
        .getElementById("gameCategory")
        .value.split(",")
        .map((cat) => cat.trim()), // Convertir categorías a un arreglo
      image: document.getElementById("gameImage").value,
    };

    console.log("Datos enviados al backend:", newGame); // Verifica los datos

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGame), // Enviar los datos al backend
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
  });

  // Manejar formulario para editar juegos
  const editGameForm = document.getElementById("editGameForm");
  if (editGameForm) {
    editGameForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const gameId = editGameForm.dataset.id; // Obtener el ID como cadena

      // Obtener los nuevos valores del formulario
      const updatedGame = {
        title: document.getElementById("editGameTitle").value,
        price: parseFloat(document.getElementById("editGamePrice").value),
        platform: document.getElementById("editGamePlatform").value,
        category: document
          .getElementById("editGameCategory")
          .value.split(",")
          .map((cat) => cat.trim()),
        image: document.getElementById("editGameImage").value,
      };

      try {
        // Enviar la solicitud PUT al backend
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
    });
  }

  // Detectar clic en el botón de editar
  const container = document.querySelector(".row"); // Donde están las tarjetas
  if (container) {
    container.addEventListener("click", async (event) => {
      if (event.target.classList.contains("edit-game-btn")) {
        const gameId = event.target.dataset.id; // Obtener el ID del juego

        try {
          // Obtener los datos del juego desde la API
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
          document.getElementById("editGamePlatform").value = game.platform;
          document.getElementById("editGameImage").value = game.image;

          // Guardar el ID del juego en el dataset del formulario
          const editGameForm = document.getElementById("editGameForm");
          editGameForm.dataset.id = gameId;
        } catch (error) {
          console.error("Error al cargar los datos del juego:", error.message);
        }
      }
      if (event.target.classList.contains("delete-game-btn")) {
        const gameId = event.target.dataset.id; // Obtener el ID del juego
        if (confirm("¿Estás seguro de eliminar este juego?")) {
          try {
            // Llamar a la API para eliminar el juego
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
    });
  }
});

/**
 *         const response = await fetch("/api/games", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newGame),
        });

        // Verificar la respuesta del servidor
        if (response.ok) {
          const addedGame = await response.json();
          console.log("Juego agregado:", addedGame);

          // Actualizar la lista de juegos en el frontend
          Dashboard();

          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("addGameModal")
          );
          modal.hide();

          // Limpiar el formulario
          addGameForm.reset();
        }
 */
