// Importaciones
// Importamos los datos iniciales y las funciones CRUD de localStorage
import { usuarios as initialUsers } from './datos.js'; 
import { obtenerUsuarioActivo, cerrarSesion, 
         inicializarUsuarios, obtenerUsuarios, // <-- Aseguramos la importación de obtenerUsuarios
         guardarUsuario, eliminarUsuario as eliminarUsuarioStorage 
} from './almacenaje.js'


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

function mostrarUsuarios() { /* Mostrar los usuarios creados ----------------------------*/
    const container = document.getElementById('lista-usuarios');
    // CLAVE: El ID lista-usuarios se inserta en el <tbody>
    container.innerHTML = '';

    // [CÓDIGO CLAVE]: Leer siempre la lista actualizada de localStorage
    const usuarios = obtenerUsuarios(); 

    usuarios.forEach((usuario, index) => {
      const fila = document.createElement('tr');
      fila.className = 'align-middle';
      
      // La contraseña debe mostrarse oculta, y pasamos el índice (index) a eliminarUsuario
      fila.innerHTML = `
        <td class="align-middle">${usuario.name}</td>
        <td class="align-middle">${usuario.email}</td>
        <td class="align-middle">********</td> 
        <td class="text-center align-middle">
          <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${index})" title="Eliminar usuario">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      container.appendChild(fila);
    });
}

// Hacemos que la función de borrado sea global para el evento onclick en el HTML
window.eliminarUsuario = function(indice) { /* Eliminar usuarios ---------------------------------*/
    const currentUser = obtenerUsuarioActivo();
    if (!currentUser) {
        alert('Debes iniciar sesión para eliminar usuarios');
        return;
    }

    const usuarios = obtenerUsuarios();
    if (currentUser.email === usuarios[indice].email) {
         alert("No puedes eliminar al usuario activo.");
         return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${usuarios[indice].name}?`)) {
        return;
    }

    try {
        // La función en almacenaje.js elimina por índice
        eliminarUsuarioStorage(indice); 
        mostrarUsuarios(); // Refrescar la tabla
    } catch (error) {
        // Esto solo debería ocurrir si el índice es inválido (que ya lo maneja almacenaje.js)
        alert('Error al eliminar el usuario: ' + error.message);
    }
}

/* EVENTOS -------------------------------------------------------------------------------------------*/

// CLAVE: Cambiar el selector del evento submit para que apunte al formulario dentro del div
document.querySelector('#usuarios form').addEventListener('submit', (e) => { 
  e.preventDefault();
  
  const name = document.getElementById('alta-usr-name').value.trim();
  const email = document.getElementById('alta-usr-email').value.trim();
  const password = document.getElementById('alta-usr-pswrd').value;

  if (!name || !email || !password) {
    alert('Todos los campos son obligatorios');
    return;
  }

  // Verificar si el email ya existe en localStorage
  if (obtenerUsuarios().some(u => u.email === email)) {
    alert('Ya existe un usuario con ese email');
    return;
  }
  
  const nuevoUsuario = {
    name,
    email,
    password 
  };
  
  // Guardar el nuevo usuario en localStorage
  guardarUsuario(nuevoUsuario);

  mostrarUsuarios(); // Refrescar la tabla
  e.target.reset();
  alert('Usuario creado correctamente.');
});

document.addEventListener('DOMContentLoaded', () => {
    // CLAVE: 1. Inicializar localStorage con los usuarios de datos.js si es la primera vez
    // Esto asegura que Hamza y Carmen se guarden si la lista 'users' está vacía.
    inicializarUsuarios(initialUsers);

    updateLoginStatus();
    // CLAVE: 2. Cargar los datos persistentes y mostrarlos.
    mostrarUsuarios(); 
});