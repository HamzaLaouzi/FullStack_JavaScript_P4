const GRAPHQL_URL = "/graphql";

// Función genérica para hacer peticiones
async function graphQLRequest(query, variables = {}) {
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    // Si tenemos token guardado, lo añadimos a la cabecera
    const token = localStorage.getItem("token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ query, variables }),
        });

        const responseBody = await response.json();

        if (responseBody.errors) {
            const message = responseBody.errors.map((e) => e.message).join(", ");
            throw new Error(message);
        }

        return responseBody.data;
    } catch (error) {
        console.error("Error en GraphQL:", error);
        throw error;
    }
}

// --- MUTACIONES (Escribir datos) ---

export async function loginApi(email, password) {
    const query = `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password)
        }
    `;
    const data = await graphQLRequest(query, { email, password });
    return data.login; // Devuelve el token
}

export async function createVoluntariado(input) {
    const query = `
        mutation CrearVoluntariado($input: VoluntariadoInput!) {
            crearVoluntariado(input: $input) {
                id
                title
                description
            }
        }
    `;
    // Aseguramos que los campos coincidan con lo que espera el servidor
    const variables = { input }; 
    const data = await graphQLRequest(query, variables);
    return data.crearVoluntariado;
}

export async function deleteVoluntariadoById(id) {
    const query = `
        mutation EliminarVoluntariado($id: ID!) {
            eliminarVoluntariado(id: $id) {
                id
                title
            }
        }
    `;
    const data = await graphQLRequest(query, { id });
    return data.eliminarVoluntariado;
}

// --- QUERIES (Leer datos) ---

export async function getVoluntariados() {
    const query = `
        query {
            voluntariados {
                id
                title
                description
                volunType
                email
                autor
            }
        }
    `;
    const data = await graphQLRequest(query);
    return data.voluntariados;
}

export async function getUsers() {
    const query = `
        query {
            usuarios {
                id
                name
                email
                role
            }
        }
    `;
    const data = await graphQLRequest(query);
    return data.usuarios;
}

// Utilidades de Sesión Local
export function saveToken(token) {
    localStorage.setItem("token", token);
    // Decodificar el token para guardar el email/rol si quieres, 
    // pero idealmente confiamos en el token.
    // Para simplificar, guardamos el email si lo tenemos a mano o lo decodificamos.
}

export function logoutUser() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

export function getActiveUserEmail() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        // Decodificación básica del Payload del JWT (parte 2)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email;
    } catch (e) {
        return null;
    }
}

export function getActiveUserRole() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role; // Asumiendo que guardaste 'role' en el token
    } catch (e) {
        return null;
    }
}