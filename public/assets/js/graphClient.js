const GRAPHQL_ENDPOINT = '/graphql'; 

/**
 * gestionar peticiones de graphql
 * @param {string} queryOrMutation - la instruccion a ejecutar
 * @param {Object} variables - por si hubiera variables
 * @param {boolean} requiresAuth - si es necesario en token jwt
 * @returns {Promise<Object>} - el objeto de la respuesta de grapohql
 */

async function executeGraphQL(queryOrMutation, variables = {}, requiresAuth = false) {
    const token = localStorage.getItem('jwtToken'); // obtener token para autenticacion
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`; // enviar el token
    }

    try {
        // API html fetch
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: queryOrMutation,
                variables: variables,
            }),
        });

        // errores del servidor
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // errores de graphql
        if (result.errors && result.errors.length > 0) {
            const errorMessages = result.errors.map(err => err.message).join('; ');
            throw new Error(errorMessages);
        }

        return result.data;

    } catch (error) {
        console.error("Error en la funcion executeGraphQL:", error);
        throw error;
    }
}

// CRUD USUARIOS ------------------------------------------------------------------------------------------------------------------------------
// obtener usuarios --------------------------------------------------
export async function getUsers() {
    const QUERY = `
        query GetUsuarios {
            usuarios {
                id
                name
                email
            }
        }
    `;
    const data = await executeGraphQL(QUERY, {}, true); // se requiere autenticacion
    return data.usuarios;
}

// crear usuarios ----------------------------------------------------
export async function createNewUser(name, email, password) {
    const MUTATION = `
        mutation CrearUsuario($input: CreateUserInput!) {
            crearUsuario(input: $input) {
                id
                name
                email
            }
        }
    `;
    const variables = {
        input: { name, email, password }
    };
    const data = await executeGraphQL(MUTATION, variables); // ruta publica
    return data.crearUsuario;
}

// actualizar usuarios -------------------------------------------------
export async function updateUser(id, input) {
    const MUTATION = `
        mutation ActualizarUsuario($id: ID!, $input: UserUpdateInput!) {
            actualizarUsuario(id: $id, input: $input) {
                id
                name
                email
            }
        }
    `;
    const variables = { id, input };
    const data = await executeGraphQL(MUTATION, variables, true); // se requiere autenticacion
    return data.actualizarUsuario;
}

// eliminar usuarios ---------------------------------------------------
export async function deleteUserById(id) {
    const MUTATION = `
        mutation EliminarUsuario($id: ID!) {
            eliminarUsuario(id: $id) {
                id
                email
            }
        }
    `;
    const variables = { id };
    const data = await executeGraphQL(MUTATION, variables, true); // se requiere autenticacion
    return data.eliminarUsuario;
}

// AUTENTICACION Y LOGIN ----------------------------------------------------------------------------------------------------------------------
// login ---------------------------------------------------------------
export async function loginApi(email, password) {
    const MUTATION = `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password)
        }
    `;
    const variables = { email, password };
    const data = await executeGraphQL(MUTATION, variables);
    return data.login; 
}

// gestion usuario activo en el navgeador ------------------------------
export function getActiveUserEmail() {
    return localStorage.getItem('activeUserEmail'); 
}

export function logoutUser() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('activeUserEmail');
}

// CRUD VOLUNTARIADOS -------------------------------------------------------------------------------------------------------------------------
// obtener voluntariados------------------------------------------------
export async function getVoluntariados() {
    const QUERY = `
        query ObtenerVoluntariados {
            voluntariados {
                id
                title
                description
                autor
                volunType
                email
                createdAt
            }
        }
    `;
    const data = await executeGraphQL(QUERY);
    return data.voluntariados;
}

// crear voluntariados--------------------------------------------------
export async function createVoluntariado(input) {
    const MUTATION = `
        mutation CrearVoluntariado($input: CreateVoluntariadoInput!) {
            crearVoluntariado(input: $input) {
                id
                title
                email
                date
                description
                volunType
                autor
                createdAt
            }
        }
    `;
    const variables = { input };
    const data = await executeGraphQL(MUTATION, variables, true); // Requiere autenticación
    return data.crearVoluntariado;
}

// eliminar voluntariados -----------------------------------------------
export async function deleteVoluntariadoById(id) {
    const MUTATION = `
        mutation EliminarVoluntariado($id: ID!) {
            eliminarVoluntariado(id: $id) {
                id
                title
            }
        }
    `;
    const variables = { id };
    const data = await executeGraphQL(MUTATION, variables, true); // Requiere autenticación
    return data.eliminarVoluntariado;
}

// actualizar voluntariados -----------------------------------------------
export async function updateVoluntariado(id, input) {
    const MUTATION = `
        mutation ActualizarVoluntariado($id: ID!, $input: UpdateVoluntariadoInput!) {
            actualizarVoluntariado(id: $id, input: $input) {
                id
                title
                email
                date
                description
                volunType
            }
        }
    `;
    const variables = { id, input };
    const data = await executeGraphQL(MUTATION, variables, true); // Requiere autenticación
    return data.actualizarVoluntariado;
}


// funcion base (específicas?)
export { executeGraphQL };