import { loginUser } from "./almacenaje.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm"); // Asegúrate que tu HTML tiene este ID

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Obtener valores
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Llamar a la API
            const success = await loginUser(email, password);

            if (success) {
                window.location.href = "index.html"; // Redirigir al Dashboard
            }
        });
    }
});