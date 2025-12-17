// Importaciones
import { 
  showActiveUser,
  fetchAllUsers,
  registerNewUser,
  removeUserById,
  getActiveUserEmail,
  getUserRole 
} from "./almacenaje.js";


/* GESTIÓN DE USUARIOS --------------------------------------------------------------------------------*/
async function initRegistro() {
    console.log("Iniciando lógica de registro.js...");

    showActiveUser();

    const user = getActiveUserEmail();
    const columnaConsulta = document.getElementById('columna-consulta'); // vista según log

    if (user) {
        if (columnaConsulta) columnaConsulta.style.display = 'block'; // loged
        await mostrarUsuarios();
    } else {
        if (columnaConsulta) columnaConsulta.style.display = 'none'; // no logged
        console.log("Usuario no logueado se le oculta tabla de users");
    }

    const form = document.getElementById('formAltaUsuario');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function mostrarUsuarios() { // usuario creados -----------------------------------------------------------
  const tableBody = document.getElementById('lista-usuarios');
  if (!tableBody) return;

  try {
    const users = await fetchAllUsers();

    // permisos
    const currentUserEmail = getActiveUserEmail();
    const currentUserRole = getUserRole();
    const visibleUsers = users.filter(user => {
        if (currentUserRole === 'admin') return true;
        return user.email === currentUserEmail;
    });

    tableBody.innerHTML = '';

    if (!visibleUsers || visibleUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center p-3">No hay usuarios registrados.</td></tr>';
        return;
    }

    visibleUsers.forEach(user => {
        const row = tableBody.insertRow();

        // boton segun permiso
        let actionButtonsHtml = '';
        if (currentUserRole === 'admin') {
            actionButtonsHtml = `
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${user.id}">
                    <i class="bi bi-trash"></i>
                </button>
            `;
        }

        row.innerHTML = `
            <td class="align-middle">${user.name}</td>
            <td class="align-middle">${user.email}</td>
            <td class="align-middle">********</td>
            <td class="text-center">
                ${actionButtonsHtml}
            </td>
        `;
    });

    if (currentUserRole === 'admin') {
        document.querySelectorAll('.delete-btn').forEach(btn => 
            btn.addEventListener('click', eliminarUsuario)
        );
    }

  } catch (error) {
    console.error("Error al mostrar usuarios:", error);
    tableBody.innerHTML = '<tr><td colspan="4" class="text-danger text-center">Error de conexión al cargar usuarios</td></tr>';
  }
}

async function eliminarUsuario(e) { /* Eliminar usuarios ---------------------------------*/
    const btn = e.target.closest('.delete-btn');
    const userId = btn.dataset.id;

    if (!confirm('¿Seguro de eliminar este usuario permanentemente?')) return;

    try {
        await removeUserById(userId);
        alert('Usuario eliminado correctamente');
        await mostrarUsuarios(); // Refrescar tabla
    } catch (error) {
        alert(`Error al eliminar: ${error.message}`);
    }
}

/* creart user -------------------------------------------------------------------------------------------*/
async function handleFormSubmit(e) { 
  e.preventDefault();
  
  const name = document.getElementById('alta-usr-name').value.trim();
  const email = document.getElementById('alta-usr-email').value.trim();
  const password = document.getElementById('alta-usr-pswrd').value;
  const role = document.getElementById('alta-usr-role').value;

  if (!name || !email || !password) {
    alert('Todos los campos son obligatorios');
    return;
  }

  try {
    const newUser = await registerNewUser(name, email, password, role);
    
    const currentUser = getActiveUserEmail();

    if (!currentUser) {
        alert("¡Registro completado! Ahora inicia sesión con tus nuevas credenciales."); // no logged
        window.location.href = 'login.html';
    } else {
        alert(`Usuario "${newUser.name}" creado correctamente.`); // loged admin
        e.target.reset();
        await mostrarUsuarios();
    }

  } catch (error) {
    alert(`Error al crear usuario: ${error.message}`);
  }
}

// Ejecutar al cargar el DOM
window.addEventListener('DOMContentLoaded', initRegistro);