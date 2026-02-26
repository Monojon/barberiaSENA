// Barber data (Mocking API response for now)
const mockBarbers = [
    { id: 1, name: 'Marco Aurelio', specialty: 'Cortes Clásicos', bio: 'Especialista en cortes clásicos y barba.', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Santiago Peña', specialty: 'Fades / Moderno', bio: 'Experto en degradados y estilos modernos.', img: 'https://images.unsplash.com/photo-1599351431247-f10b21ce5639?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Julian Castro', specialty: 'Diseño de Barba', bio: 'Más de 10 años de experiencia en diseño de barba.', img: 'https://images.unsplash.com/photo-1621605815841-aa88c8247a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }
];

document.addEventListener('DOMContentLoaded', () => {
    loadBarbers();
    setupForm();
    setupModal();
    setupAuthModals();
    checkSession();
});

let currentUser = JSON.parse(localStorage.getItem('user')) || null;

async function loadBarbers() {
    const container = document.getElementById('barbers-container');
    const select = document.getElementById('barber-select');

    // In a real app, you would fetch from your API:
    // const response = await fetch('/api/barbers');
    // const barbers = await response.json();

    const barbers = mockBarbers;

    // Clear skeletons
    container.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>Selecciona un barbero</option>';

    barbers.forEach(barber => {
        // Create Card
        const card = document.createElement('div');
        card.className = 'barber-card';
        card.innerHTML = `
            <img src="${barber.img}" alt="${barber.name}" class="barber-img">
            <div class="barber-info">
                <h3>${barber.name}</h3>
                <p class="barber-specialty">${barber.specialty}</p>
                <p>${barber.bio}</p>
            </div>
        `;
        card.onclick = () => {
            select.value = barber.id;
            document.getElementById('booking').scrollIntoView();
        };
        container.appendChild(card);

        // Populate Select
        const option = document.createElement('option');
        option.value = barber.id;
        option.textContent = barber.name;
        select.appendChild(option);
    });
}

function setupForm() {
    const form = document.getElementById('reservation-form');
    // Hide name input container if it exists
    const nameInput = document.getElementById('user-name');
    if (nameInput && nameInput.parentElement) nameInput.parentElement.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Por favor, inicia sesión para realizar un agendamiento.');
            document.getElementById('auth-modal').style.display = 'block';
            return;
        }

        const formData = {
            barberId: document.getElementById('barber-select').value,
            date: document.getElementById('booking-date').value,
            time: document.getElementById('booking-time').value,
            userId: currentUser.UserId || currentUser.id
        };

        console.log('Sending reservation:', formData);

        const btn = form.querySelector('button');
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        setTimeout(() => {
            showConfirmation({ ...formData, userName: currentUser.FullName });
            form.reset();
            btn.textContent = 'Confirmar Reserva';
            btn.disabled = false;
        }, 1500);
    };
}

function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };
}

function showConfirmation(data) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const barberName = mockBarbers.find(b => b.id == data.barberId)?.name || 'Barbero';

    body.innerHTML = `
        <h2 style="margin-bottom: 1rem; color: #d4af37;">¡Reserva Exitosa!</h2>
        <p>Gracias <strong>${data.userName}</strong>.</p>
        <p>Tu cita con <strong>${barberName}</strong> ha sido agendada para:</p>
        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
            <p>📅 <strong>${data.date}</strong></p>
            <p>⏰ <strong>${data.time}</strong></p>
        </div>
        <p style="font-size: 0.9rem; color: #a0a0a0;">Te enviaremos un recordatorio pronto.</p>
        <button onclick="document.getElementById('modal').style.display='none'" class="btn-submit" style="margin-top: 1rem;">Cerrar</button>
    `;

    modal.style.display = 'block';
}

function setupAuthModals() {
    const authModal = document.getElementById('auth-modal');
    const openBtn = document.getElementById('open-auth-btn');
    const closeBtn = document.getElementById('close-auth');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const goToReg = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');

    if (openBtn) openBtn.onclick = () => {
        authModal.style.display = 'block';
        loginView.style.display = 'block';
        registerView.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = () => authModal.style.display = 'none';

    goToReg.onclick = (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    };

    goToLogin.onclick = (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    };

    // Handle forms
    document.getElementById('login-form').onsubmit = (e) => handleAuth(e, 'login');
    document.getElementById('register-form').onsubmit = (e) => handleAuth(e, 'register');
}

async function handleAuth(e, type) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    const loginData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };
    const regData = {
        fullName: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
    };

    try {
        const response = await fetch(`/api/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(type === 'login' ? loginData : regData)
        });

        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('user', JSON.stringify(currentUser));
            checkSession();
            document.getElementById('auth-modal').style.display = 'none';
        } else {
            const error = await response.text();
            alert('Error: ' + error);
        }
    } catch (err) {
        alert('Error de conexión con el servidor');
    } finally {
        btn.disabled = false;
        btn.textContent = type === 'login' ? 'Entrar' : 'Registrarse';
    }
}

function checkSession() {
    const navAuth = document.getElementById('nav-auth-item');
    const navUser = document.getElementById('nav-user-item');
    const profileBtn = document.getElementById('user-profile-btn');

    if (currentUser) {
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) {
            navUser.style.display = 'block';
            profileBtn.textContent = currentUser.FullName.split(' ')[0];
        }
    } else {
        if (navAuth) navAuth.style.display = 'block';
        if (navUser) navUser.style.display = 'none';
    }
}
