import { GameCard } from "../components/Gamecard.js";

export async function Dashboard(category = "All") {
  const container = document.querySelector(".row");

  try {
    // Obtén todos los juegos desde la API
    console.log("Realizando solicitud a /api/games...");
    const response = await fetch("/api/games");
    console.log("Respuesta del servidor:", response);

    if (!response.ok) {
      throw new Error(`Error al obtener los juegos: ${response.statusText}`);
    }

    const games = await response.json(); // Lee la respuesta como JSON
    console.log("Juegos obtenidos desde MongoDB:", games); // Log para depuración

    // Valida que games sea un array antes de proceder
    if (!Array.isArray(games)) {
      throw new Error("Los datos obtenidos no son un arreglo válido.");
    }

    // Filtrar si la categoría no es "Todos"
    const filteredGames =
      category === "All"
        ? games
        : games.filter((game) => game.category.includes(category));

    // Renderizar las tarjetas filtradas
    container.innerHTML = GameCard(filteredGames);
    console.log(filteredGames);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
  }
}

// Llamar al Dashboard al cargar la página con "Todos"
document.addEventListener("DOMContentLoaded", () => {
  Dashboard(); // Carga todos los juegos por defecto
});
