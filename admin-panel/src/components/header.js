export function Header() {
  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">🎮 Game Library Admin</a>
        <button id="addGameBtn" class="btn btn-success ms-auto me-2">Agregar Juego</button>
        <button id="sortGamesBtn" class="btn btn-outline-light me-2">Ordenar Juegos</button>
        <input
          id="searchInput"
          class="form-control me-2"
          type="search"
          placeholder="Buscar juegos"
          style="max-width: 300px"
        />
        <button id="backDashboardBtn" class="btn btn-outline-warning">Regresar al Dashboard</button>
      </div>
    </nav>
  `;
}
