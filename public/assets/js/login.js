// importación funciones desde almacenaje ------------------------------------------
import { showActiveUser, logoutUser } from "./almacenaje.js";
import { loginApi } from "./graphClient.js";

// Elementos del DOM ---------------------------------------------------------------
const domLoginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('loginInputEmail');
const passwordInput = document.getElementById('loginInputPassword');


/**
 * lógica del login, llamada a grpahql y uso de token
 * @returns {Promise<boolean>} - si el usuario hace log es true
 */
async function handleAsyncLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const authData = await loginApi(email, password); 
        
        if (authData && authData.token) {
            // guardar token y rol
            localStorage.setItem('jwtToken', authData.token);
            localStorage.setItem('activeUserEmail', email);
            localStorage.setItem('userRole', authData.role);
            localStorage.setItem('userId', authData.userId);

            console.log("Login con éitox, el rol del usuario es:", authData.role);
            return true;
        } else {
            alert("Credenciales incorrectas o error en respuesta");
            return false;
        }

    } catch (error) {
        console.error("Error al hacer login:", error.message);
        alert(`Error en la autenticación: ${error.message}`);
        return false;
    }
}


// envío ------------------------------------------------------------------------

if (domLoginForm) {
    domLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!domLoginForm.checkValidity()) { // validar formulario
            e.stopPropagation();
            domLoginForm.classList.add('was-validated');
            return;
        }
    
        const success = await handleAsyncLogin();
        if (success) {
            window.location.href = 'index.html';
        }
    });
}


// logout -----------------------------------------------------------------------
function handleLogout() {
    logoutUser();  //elimina el token y el usuario activo
    window.location.href = 'login.html';
}

// verificar si hay usuario activo al cargar una pégina -------------------------
document.addEventListener('DOMContentLoaded', () => {
    const activeToken = localStorage.getItem('jwtToken');
    const activeEmail = localStorage.getItem('activeUserEmail');
    const navUser = document.getElementById('nav-user');
    
    if (activeToken && activeEmail && navUser) { 
        navUser.textContent = activeEmail;
        
        const logoutButton = document.createElement('button'); // se crea el botón de cerrar sesión
        logoutButton.textContent = 'Cerrar sesión';
        logoutButton.className = 'btn btn-link p-0 ms-2';
        logoutButton.onclick = handleLogout;
        
        navUser.appendChild(document.createElement('span')).textContent = '(';
        navUser.appendChild(logoutButton);
        navUser.appendChild(document.createElement('span')).textContent = ')';
    }
    
    showActiveUser();
});