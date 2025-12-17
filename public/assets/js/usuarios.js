// importación funciones dfesde almacenaje -----------------------------------------
import { 
    showActiveUser, 
    fetchAllUsers, 
    registerNewUser, 
    removeUserById 
} from "./almacenaje.js"


// mostrar la tabla de usuarios desde el servidor -----------------------------------------
export async function showUsersTable() {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return console.error("La tabla no se encuentra");

    try {
        const users = await fetchAllUsers(); // llamada al servidor
        tableBody.innerHTML = '';

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay usuarios registrados.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}">Eliminar</button>
                </td>
            `;
        });
        
        document.querySelectorAll('.delete-user-btn').forEach(button => { // listeners delete
            button.addEventListener('click', handleDeleteUser);
        });

    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-danger">Error al cargar usuarios: ${error.message}</td></tr>`;
    }
}


// eliminar usuario -----------------------------------------------------------------------
async function handleDeleteUser(e) {
    const userId = e.target.getAttribute('data-id');
    if (!confirm(`¿Seguro de que quieres eliminar el usuario: ${userId}?`)) {
        return;
    }

    try {
        await removeUserById(userId); // llamada asincrona
        alert(`El usuario ${userId} se ha eliminado correctamente.`);
        await showUsersTable(); // refresh de tabla
    } catch (error) {
        alert(`Eliminar ha fallado: ${error.message}`); // error del servidor
        console.error("Error al eliminar:", error);
    }
}

// añadir usuario ------------------------------------------------------------------------
async function handleNewUser(e) {
    e.preventDefault();
    const form = e.target;
    const name = document.getElementById('alta-usr-name').value.trim();
    const email = document.getElementById('alta-usr-email').value.trim();
    const password = document.getElementById('alta-usr-pswrd').value;

    if (!name || !email || !password) {
        alert('Todos los campos son obligatorios');
        return;
    }

    try {
        const newUser = await registerNewUser(name, email, password); // envía el nuevo user a graphql
        
        alert(`El usuario ${newUser.name} se ha creado correctamente con ID: ${newUser.id}`);
        form.reset();
        await showUsersTable(); 

    } catch (error) {
        alert(`El registro ha fallado: ${error.message}`);
        console.error("Error al registrar:", error);
    }
}


// inicio asíncrono de la página ----------------------------------------------------------------------------
async function inicializarPaginaUsuarios() {
    console.log("Iniciando página usuarios")

    showActiveUser()
    await showUsersTable()

    const formAltaUsuario = document.getElementById("formAltaUsuario") // formulario de alta
    if (formAltaUsuario) {
        console.log("El formulario se ha encontrado")
        formAltaUsuario.addEventListener("submit", handleNewUser) // función asíncrona
    } else {
        console.error("Error: el formulario no se ha encontrado")
    }
    console.log("La página usuarios se ha iniciado correctamente!")
}

// inicio página
window.addEventListener("DOMContentLoaded", inicializarPaginaUsuarios)
