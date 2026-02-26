// Check authentication
if (localStorage.getItem('isAdmin') !== 'true') {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
}

// Data Handling (Mocked for now)
const mockReservations = [
    { id: 101, user: 'Juan Pérez', barber: 'Marco Aurelio', time: '2024-05-20 10:00 AM', status: 'Confirmada' },
    { id: 102, user: 'Carlos Ruiz', barber: 'Santiago Peña', time: '2024-05-20 11:30 AM', status: 'Pendiente' },
    { id: 103, user: 'Luis Gómez', barber: 'Julian Castro', time: '2024-05-21 09:00 AM', status: 'Confirmada' }
];

const mockBarbersAdmin = [
    { id: 1, name: 'Marco Aurelio', specialty: 'Cortes Clásicos', status: 'Activo' },
    { id: 2, name: 'Santiago Peña', specialty: 'Fades / Moderno', status: 'Activo' },
    { id: 3, name: 'Julian Castro', specialty: 'Diseño de Barba', status: 'Inactivo' }
];

document.addEventListener('DOMContentLoaded', () => {
    loadReservations();
    loadBarbersAdmin();
});

function showSection(sectionId) {
    const sections = ['reservations', 'barbers-manage', 'services-manage', 'users-manage'];
    sections.forEach(id => {
        const el = document.getElementById(id + '-section');
        if (el) el.style.display = 'none';
    });

    document.getElementById(sectionId + '-section').style.display = 'block';

    // Update sidebar links active class
    const links = document.querySelectorAll('.sidebar-links a');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });
}

function loadReservations() {
    const tableBody = document.getElementById('reservations-table-body');
    tableBody.innerHTML = '';

    mockReservations.forEach(res => {
        const row = `
            <tr>
                <td>${res.user}</td>
                <td>${res.barber}</td>
                <td>${res.time}</td>
                <td><span style="color: ${res.status === 'Confirmada' ? '#2ecc71' : '#f1c40f'}">${res.status}</span></td>
                <td>
                    <button class="action-btn btn-edit">Ver</button>
                    <button class="action-btn btn-delete">Cancelar</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function loadBarbersAdmin() {
    const tableBody = document.getElementById('barbers-table-body');
    tableBody.innerHTML = '';

    mockBarbersAdmin.forEach(barber => {
        const row = `
            <tr>
                <td>${barber.name}</td>
                <td>${barber.specialty}</td>
                <td><span style="color: ${barber.status === 'Activo' ? '#2ecc71' : '#e74c3c'}">${barber.status}</span></td>
                <td>
                    <button class="action-btn btn-edit">Editar</button>
                    <button class="action-btn btn-delete">Baja</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function openAddBarberModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('add-barber-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('new-barber-name').value;
    const specialty = document.getElementById('new-barber-specialty').value;

    alert(`Barber ${name} agregado con éxito (Simulación)`);
    closeModal();
};
