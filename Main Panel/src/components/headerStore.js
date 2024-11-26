export function HeaderStore(categories = []) {
  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">🎮 Game Store</a>
        <div class="dropdown ms-auto">
          <button
            class="btn btn-outline-light dropdown-toggle"
            type="button"
            id="categoryDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Filtrar por Categoría
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="categoryDropdown">
            <li><a class="dropdown-item" href="#" data-filter="All">Todos</a></li>
            ${categories
              .map(
                (category) =>
                  `<li><a class="dropdown-item" href="#" data-filter="${category}">${category}</a></li>`
              )
              .join("")}
          </ul>
        </div>
        <input
          id="searchInput"
          class="form-control ms-3"
          type="search"
          placeholder="Buscar juegos"
          style="max-width: 300px"
        />
      </div>
    </nav>
  `;
}
