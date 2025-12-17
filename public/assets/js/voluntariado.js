import { showActiveUser, addCardDB, fetchAllVoluntariados, removeSelectedCard, getActiveUserEmail, getUserRole } from "./almacenaje.js"

let myChart = null; // variable global para el gráfico, se tiene que poder resetear para que no se superponga al actualizar voluntariados automáticamente

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
    try {
        const cards = await fetchAllVoluntariados();

        const dataByUser = {};

        cards.forEach(card => {
            const userEmail = card.email || 'Desconocido';
            
            if (!dataByUser[userEmail]) {
                dataByUser[userEmail] = { 'Petición': 0, 'Oferta': 0 };
            }
            if (card.volunType === 'Petición') {
                dataByUser[userEmail]['Petición']++;
            } else if (card.volunType === 'Oferta') {
                dataByUser[userEmail]['Oferta']++;
            }
        });

        const labels = Object.keys(dataByUser);
        const dataPeticiones = labels.map(email => dataByUser[email]['Petición']);
        const dataOfertas = labels.map(email => dataByUser[email]['Oferta']);
        const ctx = document.getElementById('canvas');
        if (!ctx) return;

        if (myChart) { // destruir gráfico antiguo para evitar superposición
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Peticiones',
                        data: dataPeticiones,
                        backgroundColor: '#0d6efd',
                        borderWidth: 1
                    },
                    {
                        label: 'Ofertas',
                        data: dataOfertas,
                        backgroundColor: '#ffc107',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });

        console.log("Grafico actualizado:", dataByUser);

    } catch (error) {
        console.error("Error al obtener datos para el grafico", error);
    }
}

// GEST WEBSOCKETS -----------------------------------------------------------------------------------------------------------------------
let socket;

function initRealTimeCon() {
    const token = localStorage.getItem('jwtToken');

    socket = io({ // autenticación
        auth: {
            token: token
        },
        reconnection: true,
        reconnectionAttempts: 5, // intentos máximos + espera entre intentos
        reconnectionDelay: 1000,
    });


    socket.on('connect', () => { // ONOPEN
        console.log('Conectado al servidor en tiempo real');
        socket.emit('join_voluntariados'); // sala específica para reducir tráfico
    });

    socket.on('voluntariados_update', async (payload) => { // ONMESSAGE cuando hay CRUD de voluntariados
        console.log('Actualización recibida:', payload);
        
        await addCardsInTable(); // tabla siempre actualizada
        await getChartData(); 
        
        notiUpdated(`Datos actualizados: ${payload.action}`);
    });

    socket.on('connect_error', (err) => { // errores
        console.error('Error al conectar socket:', err.message);
        if (err.message === "unauthorized") { // si el token caduca, redirigir a login
            alert("La sesión ha expirado, por favor inicia sesión de nuevo");
            localStorage.removeItem('jwtToken'); // limpiar token antiguo
            localStorage.removeItem('activeUserEmail');
            window.location.href = "login.html";
        }
    });

    socket.on('disconnect', (reason) => {
        console.warn('Desconectado del servidor en tiempo real:', reason);
        if (reason === 'io server disconnect') {
            socket.connect(); // reconectar
        }
    });
}

function notiUpdated(mensaje) { // toast visual para feedback de updates
    const toast = document.createElement('div');
    toast.className = 'alert alert-info position-fixed bottom-0 end-0 m-3 p-2 small shadow';
    toast.style.zIndex = '9999';
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
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

    initRealTimeCon(); // iniciar sockets
    
    console.log("página voluntariados iniciada");
});