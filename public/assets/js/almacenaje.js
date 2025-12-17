import { 
    loginApi, 
    saveToken, 
    getActiveUserEmail, 
    getVoluntariados,
    createVoluntariado,
    deleteVoluntariadoById,
    logoutUser
} from "./graphClient.js";

// --- AUTENTICACIÓN ---

// Esta función será llamada desde login.js
export async function loginUser(email, password) {
    try {
        const token = await loginApi(email, password);
        if (token) {
            saveToken(token);
            return true;
        }
        return false;
    } catch (error) {
        alert("Error de Login: " + error.message);
        return false;
    }
}

export function showActiveUser() {
    const domUserLogged = document.getElementById("activeUser") || document.getElementById("nav-user");
    if (!domUserLogged) return;
    
    const email = getActiveUserEmail();
    domUserLogged.textContent = email ? email : "Invitado";
    
    // Opcional: Mostrar botón Logout si hay usuario
}

// --- VOLUNTARIADOS ---

export async function fetchAllVoluntariados() {
    return await getVoluntariados();
}

export async function addCardDB(data) {
    // Adaptamos los datos del formulario al Input de GraphQL
    const input = {
        title: data.title,
        description: data.description,
        volunType: data.volunType,
        email: data.email,
        autor: data.autor
    };
    return await createVoluntariado(input);
}

export async function removeSelectedCard(id) {
    return await deleteVoluntariadoById(id);
}

// Re-exportamos para que otros archivos lo usen
export { logoutUser };