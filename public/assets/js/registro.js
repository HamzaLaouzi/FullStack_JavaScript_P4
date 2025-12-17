// Importaciones
import { 
  showActiveUser,
  fetchAllUsers,
  registerNewUser,
  removeUserById 
} from "./almacenaje.js";


/* GESTIÓN DE USUARIOS --------------------------------------------------------------------------------*/

// Función para actualizar el estado de login en la interfaz
function updateLoginStatus() {
    // ... (Código para actualizar la barra de navegación)
    const currentUser = obtenerUsuarioActivo();
    const navUser = document.getElementById('nav-user');
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (currentUser) {
        if (navUser) {
            navUser.textContent = currentUser.email;
        }
        if (loginLink) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = function(e) {
                e.preventDefault();
                cerrarSesion();
                // Redirigir al login después de cerrar sesión
                window.location.href = 'login.html'; 
            }
        }
    } else {
        if (navUser) {
            navUser.textContent = '-no login-';
        }
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
            loginLink.onclick = null;
        }
    }
}

async function mostrarUsuarios() { /* Mostrar los usuarios creados ----------------------------*/
    const container = document.getElementById('lista-usuarios');
    // CLAVE: El ID lista-usuarios se inserta en el <tbody>
    container.innerHTML = '';

    try {
    const usuarios = await fetchAllUsers();
    
    usuarios.forEach((usuario) => {
      const fila = document.createElement('tr');
      fila.className = 'align-middle';
      fila.innerHTML = `
        <td class="align-middle">${usuario.name}</td>
        <td class="align-middle">${usuario.email}</td>
        <td class="align-middle">********</td>
        <td class="text-center align-middle">
          <button class="btn btn-sm btn-danger delete-user-btn" data-id="${usuario.id}" title="Eliminar usuario">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      container.appendChild(fila);
    });
    document.querySelectorAll('.delete-user-btn').forEach(button => {
      button.addEventListener('click', eliminarUsuario);
    });

  } catch (error) {
    console.error("Error al mostrar usuarios:", error);
    container.innerHTML = '<tr><td colspan="4" class="text-danger">Error al cargar usuarios</td></tr>';
  }
}

async function eliminarUsuario(e) { /* Eliminar usuarios ---------------------------------*/
    const userId = e.currentTarget.getAttribute('data-id');
    if (!confirm('¿Seguro de eliminar este usuario?')) return;

  try {
    await removeUserById(userId);
    alert('Usuario eliminado correctamente');
    await mostrarUsuarios();
  } catch (error) {
    alert(`Error al eliminar: ${error.message}`);
    console.error("Error:", error);
  }
}

/* EVENTOS -------------------------------------------------------------------------------------------*/

document.querySelector('#usuarios form').addEventListener('submit', async (e) => { 
  e.preventDefault();
  
  const name = document.getElementById('alta-usr-name').value.trim();
  const email = document.getElementById('alta-usr-email').value.trim();
  const password = document.getElementById('alta-usr-pswrd').value;

  if (!name || !email || !password) {
    alert('Todos los campos son obligatorios');
    return;
  }

  try {
    await registerNewUser(name, email, password);
    alert('Usuario creado correctamente');
    e.target.reset();
    await mostrarUsuarios();
  } catch (error) {
    alert(`Error al crear usuario: ${error.message}`);
    console.error("Error:", error);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  showActiveUser();
  await mostrarUsuarios();
});