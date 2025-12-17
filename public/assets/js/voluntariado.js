import { showActiveUser, addCardDB, fetchAllVoluntariados, removeSelectedCard, getActiveUserEmail, getUserRole } from "./almacenaje.js"

// declaramos constantes para obtener el ID de diferentes elementos del DOM
const submitButton = document.getElementById("submitId")

async function addCardsInTable() {
    const tableBody = document.getElementById('volTableBody'); 
    if (!tableBody) return console.error("Error: La tabla de voluntariados no se encuentra.");

    try {
        const cards = await fetchAllVoluntariados(); 

        const currentUserEmail = getActiveUserEmail();
        const currentUserRole = getUserRole();
        
        // filtro por rol (admin ve todos los vols y user solo los suyos)
        const visibleCards = cards.filter(card => {
            if (currentUserRole === 'admin') {
                return true;
            }
            return card.email === currentUserEmail; 
        });
        
        tableBody.innerHTML = '';

        if (visibleCards.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay voluntariados registrados.</td></tr>';
            return;
        }

        visibleCards.forEach(card => {
            const row = tableBody.insertRow();

            row.innerHTML = `
                <td>${card.email}</td>
                <td>${card.date}</td>
                <td>${card.title}</td>
                <td>${card.description}</td>
                <td>${card.volunType}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-card-btn" data-id="${card.id}">Eliminar</button>
                </td>
            `;
        });

        document.querySelectorAll('.delete-card-btn').forEach(button => {
            button.addEventListener('click', handleDeleteCard);
        });

    } catch (error) {
        console.error("Error al cargar la tabla de voluntariados:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar datos: ${error.message}</td></tr>`;
    }
}

async function getChartData() {
    console.log("Inicializando gráficos (Placeholder)...");

    try {
        const cards = await fetchAllVoluntariados();
        

        const counts = cards.reduce((acc, card) => {
            acc[card.volunType] = (acc[card.volunType] || 0) + 1;
            return acc;
        }, {});

        console.log("Datos procesados para el gráfico:", counts);

    } catch (error) {
        console.error("Error al obtener datos para el gráfico:", error);
    }
}

async function handleNewCard(event) {
    event.preventDefault(); // Detener el envío del formulario
    
    const title = document.getElementById("newVolTitleId").value.trim();
    const email = document.getElementById("newVolEmailId").value.trim();
    const date = document.getElementById("volDateId").value;
    const description = document.getElementById("newVolDescriptionId").value.trim();
    const volunType = document.getElementById("volSelectId").value;
    const autor = getActiveUserEmail();

    if (!title || !email || !date || !description || !volunType) {
        alert("Todos los campos son oblugatorios.");
        return;
    }
    
    const input = { 
        title,
        email,
        date,
        description, 
        volunType,
        autor
    };

    try {
        await addCardDB(input); // llamada asíncrona
        alert(`Voluntariado '${title}' creado correctamente.`);
        document.getElementById("formVoluntariado");
        await addCardsInTable();
        await getChartData(); 

    } catch (error) {
        alert(`Error al crear el voluntariado: ${error.message}`);
        console.error("Error al crear la tarjeta:", error);
    }
}

export async function handleDeleteCard(event) {
    const cardId = event.target.dataset.id;
    
    if (!cardId) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este voluntariado?')) {
        return;
    }

    try {
        const deletedCard = await removeSelectedCard(cardId);
        
        alert(`Voluntariado con ID ${deletedCard.id} eliminado.`);

        await addCardsInTable(); // Recargar la lista de tarjetas

    } catch (error) {
        alert(`Error al eliminar el voluntariado: ${error.message}`);
        console.error("Error al eliminar la tarjeta:", error);
    }
}

// inicialización
const formVoluntariado = document.getElementById("formVoluntariado"); // id del formulario
if (formVoluntariado) {
    formVoluntariado.addEventListener("submit", handleNewCard);
} else if (submitButton) {
    submitButton.addEventListener("click", handleNewCard);
}



window.addEventListener("DOMContentLoaded", async () => {
    console.log(" INICIANDO VOLUNTARIADOS ");
    
    const user = getActiveUserEmail();

    if (!user) { // check logged para mostrar página
        alert("Inicia sesión para acceder a la gestión de voluntariados.");
        window.location.href = "login.html";
        return;
    }

    showActiveUser();
    
    await addCardsInTable();
    await getChartData();
    
    console.log("página voluntariados iniciada");
});