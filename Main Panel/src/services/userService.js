// Obtener usuarios desde el backend
export async function fetchUsers() {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error("Error al obtener usuarios");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    return [];
  }
}

// Eliminar un usuario por ID
export async function deleteUser(userId) {
  try {
    const response = await fetch(`/api/users${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el usuario");
    }

    Swal.fire({
      icon: "success",
      title: "Usuario eliminado",
      text: "El usuario ha sido eliminado correctamente.",
    });

    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar el usuario.",
    });

    return false;
  }
}
