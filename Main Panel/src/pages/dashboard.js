import { GameCard } from "../components/Gamecard.js";

export async function Dashboard(category = "All", page = 1) {
  const container = document.querySelector(".row");
  const itemsPerPage = 8; // Juegos por página

  try {
    // Obtener todos los juegos desde la API
    const response = await fetch("http://localhost:3000/api/games");

    if (!response.ok)
      throw new Error(`Error al obtener los juegos: ${response.statusText}`);

    const games = await response.json(); // Leer la respuesta como JSON

    // Validar que `games` sea un arreglo
    if (!Array.isArray(games))
      throw new Error("Los datos obtenidos no son un arreglo válido.");

    // Filtrar juegos por categoría
    const filteredGames =
      category === "All"
        ? games // Si es "All", devolver todos los juegos
        : games.filter((game) =>
            game.category.some(
              (cat) => cat.toLowerCase() === category.toLowerCase()
            )
          );

    // Paginación
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedGames = filteredGames.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    // Renderizar las tarjetas paginadas
    container.innerHTML = GameCard(paginatedGames);

    // Actualizar los botones de paginación
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
    renderPagination(totalPages, page, category);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    container.innerHTML =
      "<p class='text-center text-danger'>Error al cargar los juegos.</p>";
  }
}

function renderPagination(totalPages, currentPage, category) {
  const paginationContainer = document.querySelector("#pagination");
  paginationContainer.innerHTML = ""; // Limpiar paginación previa

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.className = "btn btn-primary mx-1";
    button.textContent = i;

    // Resaltar la página actual
    if (i === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      Dashboard(category, i); // Llamar al Dashboard con la nueva página
    });

    paginationContainer.appendChild(button);
  }
}

// Llamar al Dashboard al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  Dashboard("All", 1); // Cargar todos los juegos por defecto en la página 1
});

// // Filtrar si la categoría no es "Todos"
// const filteredGames =
//   category === "All"
//     ? games
//     : games.filter((game) => game.category.includes(category));
