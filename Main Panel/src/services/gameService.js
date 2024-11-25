const API_URL = "http://localhost:3000/api/games";

export async function getGames() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function addGame(game) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
  return response.json();
}

export async function updateGame(id, game) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
  return response.json();
}

export async function deleteGame(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return response.json();
}
