const API_URL = "http://localhost:3000/api/games";

// Obtener todos los juegos
export async function getGames() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener los juegos.");
    }
    return response.json();
  } catch (error) {
    console.error("Error en getGames:", error);
    throw error;
  }
}

// Agregar un nuevo juego
export async function addGame(game) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(game),
    });
    if (!response.ok) {
      throw new Error("Error al agregar el juego.");
    }
    return response.json();
  } catch (error) {
    console.error("Error en addGame:", error);
    throw error;
  }
}

// Actualizar un juego existente
export async function updateGame(id, game) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(game),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el juego.");
    }
    return response.json();
  } catch (error) {
    console.error("Error en updateGame:", error);
    throw error;
  }
}

// Eliminar un juego por su ID
export async function deleteGame(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Error al eliminar el juego.");
    }
    return response.json();
  } catch (error) {
    console.error("Error en deleteGame:", error);
    throw error;
  }
}

// Obtener todas las categorías
export async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      throw new Error("Error al obtener las categorías.");
    }
    return response.json();
  } catch (error) {
    console.error("Error en getCategories:", error);
    throw error;
  }
}

// Obtener juegos filtrados por categoría
export async function getGamesByCategory(category) {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [category] }),
    });
    if (!response.ok) {
      throw new Error("Error al obtener los juegos por categoría.");
    }
    return response.json();
  } catch (error) {
    console.error("Error en getGamesByCategory:", error);
    throw error;
  }
}
