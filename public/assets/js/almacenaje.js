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
 * @returns {Promise<Array>} - devuelve un array de usuarios
*/
export async function fetchAllUsers() {
    try {
        return await getUsers(); // llamada fecth en getUsers
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        throw error;
    }
}

// crear usuario ---------------------------------------------
export async function registerNewUser(name, email, password) {
    try {
        const newUser = await createNewUser(name, email, password); // llamada a graphql
        console.log("El usuario s eha creado con éxito", newUser);
        return newUser;
    } catch (error) {
        console.error("Error al crear usuario:", error.message);
        throw error; 
    }
}

// actualizar user -------------------------------------------
export async function updateExistingUser(userId, input) {
    try {
        const updatedUser = await updateUser(userId, input); // llamada a graphql
        console.log("El usuario se ha actualizado con éxito", updatedUser);
        return updatedUser;
    } catch (error) {
        console.error("Error al actualizar usuario:", error.message);
        throw error; 
    }
}

// eliminar usuario -------------------------------------------
export async function removeUserById(userId) {
    try {
        const deletedUser = await deleteUserById(userId); // llamada a graphql
        console.log("El usuario se ha eliminado con éxito:", deletedUser);
        return deletedUser;
    } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
        throw error;
    }
}

// LOGIN Y AUTENTICACION --------------------------------------------------------------------------
// mostrar el usuario activo ----------------------------------
export function showActiveUser() {
    const domUserLogged = document.getElementById("activeUser") || document.getElementById("nav-user");

    if (!domUserLogged) return;

    const userEmail = getActiveUserEmail();

    if (userEmail) {
        domUserLogged.textContent = userEmail;
    } else {
        domUserLogged.textContent = "-no login-";
    }
}

// hacer login ------------------------------------------------
export function loginUser() {
    console.warn("loginUser() ha sido reescrita. Se necesita async/await en login.js para usar el servicio JWT.");
    alert("Proceso de Login deshabilitado temporalmente. Continúa con la Fase 2 (Login/JWT).");
    return false;
}

// BORRAR??? ---------------------------------------------------------------------------------------------
export function loadUsersToStorage() {
    console.warn("loadUsersToStorage() está obsoleto. La carga es asíncrona via fetchAllUsers().");
}

// CRUD VOLUNTARIADOS -------------------------------------------------------------------------------------
// obtener voluntariados --------------------------------------
export async function fetchAllVoluntariados() {
    try {
        // --------------------------------------LOAD CARDS/START DB ?????????????????
        return await getVoluntariados(); 
    } catch (error) {
        console.error("Error al obtener los voluntariados:", error);
        throw error;
    }
}

// crear voluntariado ------------------------------------------
export async function addCardDB(input) {
    try {
        const newCard = await createVoluntariado(input); 
        console.log("El voluntariado se ha creado con éxito", newCard);
        return newCard;
    } catch (error) {
        console.error("Error al crear voluntariado:", error.message);
        throw error;
    }
}

// eliminar voluntariado ----------------------------------------
export async function removeSelectedCard(cardId) {
    try {
        const deletedCard = await deleteVoluntariadoById(cardId); 
        console.log("Voluntariado eliminado con éxito:", deletedCard);
        return deletedCard;
    } catch (error) {
        console.error("Error al eliminar voluntariado:", error.message);
        throw error;
    }
}

// actualizar voluntariado ---------------------------------------
export async function updateCardDB(cardId, input) {
    try {
        const updatedCard = await updateVoluntariado(cardId, input); 
        console.log("Voluntariado actualizado con éxito:", updatedCard);
        return updatedCard;
    } catch (error) {
        console.error("Error al actualizar voluntariado:", error.message);
        throw error;
    }
}

export { logoutUser, loginApi, getActiveUserEmail}; 
