import { GameCard } from "../components/Gamecard.js";
import { getGames } from "../services/gameService.js";

/*export async function Dashboard() {
  const games = await getGames();
  const container = document.querySelector(".row");
  container.innerHTML = games.map(GameCard).join("");
}
 */

export function Dashboard() {
  const container = document.querySelector(".row");
  container.innerHTML = GameCard();
}
