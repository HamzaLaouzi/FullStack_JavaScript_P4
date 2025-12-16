import { 
    showActiveUser, 
    fetchAllVoluntariados
} from './almacenaje.js'

// declaramos constantes para identificar los 2 contenedores y las hacemos globales
window.dragContainer = document.getElementById("dragContainer")
window.dropContainer = document.getElementById("dropContainer")

const dragContainer = window.dragContainer
const dropContainer = window.dropContainer

// DRAG & DROP -----------------------------------------------------------------------------------

// listener para que las tarjetas del "dropContainer" (Selección) sean droppable
dropContainer.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropContainer.style.backgroundColor = "rgba(0, 0, 0, 0.08)" // efecto visual al arrastrar
})

dropContainer.addEventListener("dragleave", () => {
    dropContainer.style.backgroundColor = "" // elimina efecto visual
})

dropContainer.addEventListener("drop", (e) => {
    e.preventDefault()
    dropContainer.style.backgroundColor = "" // elimina efecto visual

    const cardTitleSafe = e.dataTransfer.getData("text/plain")
    if (!cardTitleSafe) return

    // mover SIEMPRE de disponibles a selección
    moveCard(cardTitleSafe, dragContainer, dropContainer)
})

// listener para que las tarjetas del "dragContainer" (Disponibles) sean droppable
dragContainer.addEventListener("dragover", (e) => {
    e.preventDefault()
    dragContainer.style.backgroundColor = "rgba(0, 0, 0, 0.08)" // efecto visual al arrastrar
})

dragContainer.addEventListener("dragleave", () => {
    dragContainer.style.backgroundColor = "" // elimina efecto visual
})

dragContainer.addEventListener("drop", (e) => {
    e.preventDefault()
    dragContainer.style.backgroundColor = "" // elimina efecto visual

    const cardTitleSafe = e.dataTransfer.getData("text/plain")
    if (!cardTitleSafe) return

    // mover SIEMPRE de selección a disponibles
    moveCard(cardTitleSafe, dropContainer, dragContainer)
})

// CREACIÓN TARJETAS----------------------------------------------------------------------------------------------
function createCardElement(card) {
    const cardElement = document.createElement('div');
    
    cardElement.className = 'card mb-3 shadow-sm card-draggable';
    cardElement.draggable = true;
    cardElement.id = `card-${card.id}`; 
    cardElement.dataset.volunType = card.volunType; 
    
    cardElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id); 
    });

    cardElement.innerHTML = `
        <div class="card-body">
            <span class="badge ${card.volunType === 'Oferta' ? 'bg-success' : 'bg-warning text-dark'}">${card.volunType}</span>
            <h5 class="card-title mt-2">${card.title}</h5>
            <p class="card-text">${card.description.substring(0, 100)}${card.description.length > 100 ? '...' : ''}</p>
            <p class="card-subtitle mb-2 text-muted small">
                Autor: ${card.autor} (${card.email}) <br>
                Fecha: ${card.createdAt}
            </p>
        </div>
    `;

    return cardElement;
}

function initFilter(cards) {
    console.log('Inicializando filtros con', cards.length, 'voluntariados.');
    
    const tabPeticiones = document.getElementById('tab-peticiones');
    const tabOfertas = document.getElementById('tab-ofertas');
    const tabTodas = document.getElementById('tab-todas');
    
    if (!tabPeticiones || !tabOfertas || !tabTodas) return;

    const buttons = [tabPeticiones, tabOfertas, tabTodas];

    function setActive(btn) {
        buttons.forEach(b => {
            b.classList.remove("btn-primary");
            b.classList.add("btn-outline-primary");
        });
        btn.classList.remove("btn-outline-primary");
        btn.classList.add("btn-primary");
    }
    
    tabPeticiones.addEventListener("click", () => {
        setActive(tabPeticiones);
        applyFilter("Petición");
    });

    tabOfertas.addEventListener("click", () => {
        setActive(tabOfertas);
        applyFilter("Oferta");
    });

    tabTodas.addEventListener("click", () => {
        setActive(tabTodas);
        applyFilter("todos");
    });

    setActive(tabTodas);
    applyFilter("todos");
}

// FILTRO TABS ----------------------------------------------------------------------------------------------

let currentFilter = "todos"

function applyFilter(filter) {
    currentFilter = filter

    if (!dragContainer) return

    const cards = dragContainer.querySelectorAll(".dragBox")

    cards.forEach(card => {
        const type = card.dataset.volunType  // "Petición" o "Oferta"

        if (filter === "todos" || !type) {
            card.classList.remove("d-none")
        } else {
            if (type === filter) {
                card.classList.remove("d-none")
            } else {
                card.classList.add("d-none")
            }
        }
    })
}

function initFilterTabs() {
    const tabPeticiones = document.getElementById("tab-peticiones")
    const tabOfertas = document.getElementById("tab-ofertas")
    const tabTodas = document.getElementById("tab-todas")

    if (!tabPeticiones || !tabOfertas || !tabTodas) return

    const buttons = [tabPeticiones, tabOfertas, tabTodas]

    function setActive(btn) {
        buttons.forEach(b => {
            b.classList.remove("btn-primary")
            b.classList.add("btn-outline-primary")
        })
        btn.classList.remove("btn-outline-primary")
        btn.classList.add("btn-primary")
    }

    tabPeticiones.addEventListener("click", () => {
        setActive(tabPeticiones)
        applyFilter("Petición")
    })

    tabOfertas.addEventListener("click", () => {
        setActive(tabOfertas)
        applyFilter("Oferta")
    })

    tabTodas.addEventListener("click", () => {
        setActive(tabTodas)
        applyFilter("todos")
    })
}

// CARGAR TARJETAS -------------------------------------------------------------------------
async function loadAndRenderCards() {
    const dragContainer = window.dragContainer;
    
    dragContainer.innerHTML = ''; 

    try {
        const cards = await fetchAllVoluntariados(); 
        
        if (cards.length === 0) {
            dragContainer.innerHTML = '<p class="text-center">No hay voluntariados disponibles.</p>';
            return [];
        }

        cards.forEach(card => {
            const cardElement = createCardElement(card); 
            dragContainer.appendChild(cardElement);
        });

        return cards; 

    } catch (error) {
        console.error("Error al cargar los voluntariados:", error);
        dragContainer.innerHTML = '<p class="text-danger">Error al conectar con el servidor.</p>';
        return [];
    }
}

// INICIALIZACIÓN ---------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
    console.log("=== index.js DOMContentLoaded ===")
    showActiveUser()

    const allCards = await loadAndRenderCards();
    
    initFilter(allCards)
    initFilterTabs()
    console.log("Página principal iniciada")
});
