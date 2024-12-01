import { GameCard } from "../components/Gamecard.js";

export async function Dashboard(category = "All") {
  const container = document.querySelector(".row");

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

    // Renderizar las tarjetas filtradas
    container.innerHTML = GameCard(filteredGames);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    container.innerHTML =
      "<p class='text-center text-danger'>Error al cargar los juegos.</p>";
  }
}

// Llamar al Dashboard al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  Dashboard(); // Cargar todos los juegos por defecto
});

// // Filtrar si la categoría no es "Todos"
// const filteredGames =
//   category === "All"
//     ? games
//     : games.filter((game) => game.category.includes(category));
