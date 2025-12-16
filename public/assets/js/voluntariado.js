import { showActiveUser, addCardDB, fetchAllVoluntariados, removeSelectedCard, getActiveUserEmail } from "./almacenaje.js"

// declaramos constantes para obtener el ID de diferentes elementos del DOM
const submitButton = document.getElementById("submitId")

async function addCardsInTable() {
    const tableBody = document.getElementById('volTableBody'); 
    if (!tableBody) return console.error("Error: La tabla de voluntariados (<tbody>) no se encuentra.");

    try {
        const cards = await fetchAllVoluntariados(); 
        
        tableBody.innerHTML = '';

        if (cards.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay voluntariados registrados.</td></tr>';
            return;
        }

        cards.forEach(card => {
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
    
    const title = document.getElementById("titleId").value.trim();
    const description = document.getElementById("descId").value.trim();
    const volunType = document.getElementById("volunTypeId").value;
    const activeUserEmail = getActiveUserEmail();

    if (!activeUserEmail) {
        alert('Debes iniciar sesión para crear un voluntariado');
        return;
    }
    
    const input = { 
        title, 
        description, 
        volunType, 
        autor: activeUserEmail,
        email: activeUserEmail,
    };

    try {
        const newCard = await addCardDB(input); // llamada asíncrona
        alert(`Voluntariado '${newCard.title}' creado correctamente.`);

        event.target.reset(); 
        
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
        // [ANTES]: removeSelectedCard(cardId) era síncrono o REST.
        // [AHORA]: removeSelectedCard es la función wrapper asíncrona de GraphQL.
        const deletedCard = await removeSelectedCard(cardId);
        
        alert(`Voluntariado con ID ${deletedCard.id} eliminado.`);

        await loadCards(); // Recargar la lista de tarjetas

    } catch (error) {
        alert(`Error al eliminar el voluntariado: ${error.message}`);
        console.error("Error al eliminar la tarjeta:", error);
    }
}

const formVoluntariado = document.getElementById("formVoluntariado"); // id del formulario
if (formVoluntariado) {
    formVoluntariado.addEventListener("submit", handleNewCard);
} else {

    submitButton.addEventListener("click", handleNewCard);
}



window.addEventListener("DOMContentLoaded", async () => {
    console.log("=== voluntariado.js DOMContentLoaded -ASINCRONA ==")
    
    showActiveUser()
    
    await addCardsInTable()
    await getChartData()
    
    console.log("página voluntariados iniciada")
})