/* 
Operaciones de almacenamiento y gestión entre cliente y servidor (interfaz y graphql)

importa las funciones graphql y exporta funciones a los scripts de cada página

CRUD de usuarios y voluntariados, autenticación y usuario activo
*/

// importación funciones graphql desde el client -----------------------------------------
import {  
    getUsers, 
    createNewUser,
    updateUser, 
    deleteUserById,
    getVoluntariados,
    createVoluntariado,
    deleteVoluntariadoById,
    updateVoluntariado,
    loginApi,
    logoutUser,
    getActiveUserEmail 
} from "./graphClient.js";

// CRUD USUARIOS --------------------------------------------------------------------------
/** obtener todos los usuarios -------------------------------
 * se llama desde registro.js, requiere autenticación
 * @returns {Promise<Array>} - devuelve un array de usuarios
*/
export async function fetchAllUsers() {
    try {
        return await getUsers(); // ejecuta query para obtener usuarios
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        throw error;
    }
}

// crear usuario ---------------------------------------------
// se llama desde registro.js, requiere autenticación
export async function registerNewUser(name, email, password, role) {
    try {
        const newUser = await createNewUser(name, email, password, role); // ejecuta mut para crear el usuario con el input
        console.log("El usuario s eha creado con éxito", newUser);
        return newUser;
    } catch (error) {
        console.error("Error al crear usuario:", error.message);
        throw error; 
    }
}

// actualizar user -------------------------------------------
// requiere autenticación
export async function updateExistingUser(userId, input) {
    try {
        const updatedUser = await updateUser(userId, input); // ejecuta mut para actualizar el usuario con el input
        console.log("El usuario se ha actualizado con éxito", updatedUser);
        return updatedUser;
    } catch (error) {
        console.error("Error al actualizar usuario:", error.message);
        throw error; 
    }
}

// eliminar usuario -------------------------------------------
// se llama desde registro.js, requiere autenticación
export async function removeUserById(userId) {
    try {
        const deletedUser = await deleteUserById(userId); // // ejecuta mut para eliminar el usuario
        console.log("El usuario se ha eliminado con éxito:", deletedUser);
        return deletedUser;
    } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
        throw error;
    }
}

// LOGIN Y AUTENTICACION --------------------------------------------------------------------------
// obtener rol del usuario -----------------------------------
// se llama para obtener el rol del user y determinar permisos
export function getUserRole() {
    return localStorage.getItem('userRole'); // admin, user o null
}

// mostrar el usuario activo ----------------------------------
// vista log navbar, logout dinámico
export function showActiveUser() {
    const domUserLogged = document.getElementById("activeUser") || document.getElementById("nav-user"); // dónde mostrar el usuario

    if (!domUserLogged) return; // si no existe, terminar

    const userEmail = getActiveUserEmail();

    if (userEmail) { // si hay log, mostrar opcion correo y logout
        domUserLogged.innerHTML = ''; 
        const emailSpan = document.createElement("span"); // crear el correo para mostrar
        emailSpan.textContent = userEmail; // + (userRole === 'admin' ? ' [Admin]' : '');
        domUserLogged.appendChild(emailSpan);

        const logoutLink = document.createElement("a"); // logout dinámico
        logoutLink.href = "#";
        logoutLink.textContent = " (Logout)";
        logoutLink.className = "text-danger ms-2 text-decoration-none";
        logoutLink.style.cursor = "pointer";
        logoutLink.addEventListener("click", (e) => { // cerrar la sesión
            e.preventDefault();
            logoutUser(); // limpia el correo y el token
            window.location.href = "login.html";
        });
        domUserLogged.appendChild(logoutLink);
    } else {
        domUserLogged.textContent = "-no login-";
    }
}

// CRUD VOLUNTARIADOS -------------------------------------------------------------------------------------
// obtener voluntariados --------------------------------------
// se llama desde index.js, voluntariado.js, público
export async function fetchAllVoluntariados() {
    try {
        return await getVoluntariados(); // ejecuta query para mostrar voluntariados
    } catch (error) {
        console.error("Error al obtener los voluntariados:", error);
        throw error;
    }
}

// crear voluntariado ------------------------------------------
// se llama desde voluntariado.js, requiere autenticación, evento websocket
export async function addCardDB(input) {
    try {
        const newCard = await createVoluntariado(input); // ejecuta mut para crear voluntariado
        console.log("El voluntariado se ha creado con éxito");
        return newCard;
    } catch (error) {
        console.error("Error al crear voluntariado:", error.message);
        throw error;
    }
}

// eliminar voluntariado ----------------------------------------
// se llama desde voluntariado.js, requiere autenticación, evento websocket
export async function removeSelectedCard(cardId) {
    try {
        const deletedCard = await deleteVoluntariadoById(cardId); // ejecuta mut para eliminar voluntariado
        console.log("Voluntariado eliminado con éxito:", deletedCard);
        return deletedCard;
    } catch (error) {
        console.error("Error al eliminar voluntariado:", error.message);
        throw error;
    }
}

// actualizar voluntariado ---------------------------------------
// requiere autenticación, evento websocket
export async function updateCardDB(cardId, input) {
    try {
        const updatedCard = await updateVoluntariado(cardId, input); // ejecuta mut para actualizar voluntariado
        console.log("Voluntariado actualizado con éxito:", updatedCard);
        return updatedCard;
    } catch (error) {
        console.error("Error al actualizar voluntariado:", error.message);
        throw error;
    }
}

export { logoutUser, loginApi, getActiveUserEmail}; 
