const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqliteDb = require('./init_sqlite'); // Importamos la conexión SQLite

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper para ejecutar queries en SQLite
async function executeQuery(query, params = {}) {
    return new Promise((resolve, reject) => {
        const sqliteQuery = query.replace(/@(\w+)/g, '?');
        const values = Object.values(params);

        if (query.trim().toUpperCase().startsWith('SELECT')) {
            sqliteDb.all(sqliteQuery, values, (err, rows) => {
                if (err) reject(err);
                else resolve({ recordset: rows });
            });
        } else {
            sqliteDb.run(sqliteQuery, values, function (err) {
                if (err) reject(err);
                else resolve({ recordset: [{ id: this.lastID }] });
            });
        }
    });
}

// Admin Auth Middleware
const isAdmin = (req, res, next) => {
    if (req.headers['authorization'] === 'AdminSecretToken') next();
    else res.status(401).send('No autorizado');
};

// API Routes
app.get('/api/barbers', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Barbers WHERE IsActive = 1');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const check = await executeQuery('SELECT UserId FROM Users WHERE Email = @email', { email });
        if (check.recordset.length > 0) return res.status(400).send('Email ya registrado');

        await executeQuery('INSERT INTO Users (FullName, Email, PasswordHash, UserRole) VALUES (@name, @email, @pass, "Customer")', {
            name: fullName, email, pass: password
        });
        const user = await executeQuery('SELECT UserId, FullName, Email FROM Users WHERE Email = @email', { email });
        res.status(201).json(user.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await executeQuery('SELECT UserId, FullName, Email, UserRole FROM Users WHERE Email = @email AND PasswordHash = @pass', {
            email, pass: password
        });
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(401).send('Credenciales inválidas');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/reservations', async (req, res) => {
    const { barberId, date, time, userId } = req.body;
    try {
        await executeQuery('INSERT INTO Reservations (UserId, BarberId, ReservationTime, Status) VALUES (@u, @b, @t, "Confirmed")', {
            u: userId, b: barberId, t: `${date} ${time}`
        });
        res.status(201).send('Reserva creada');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Admin Routes
app.get('/api/admin/reservations', isAdmin, async (req, res) => {
    try {
        const result = await executeQuery(`
            SELECT R.ReservationId, U.FullName as UserName, B.FullName as BarberName, R.ReservationTime, R.Status 
            FROM Reservations R
            JOIN Users U ON R.UserId = U.UserId
            JOIN Barbers B ON R.BarberId = B.BarberId
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/admin/barbers', isAdmin, async (req, res) => {
    const { fullName, specialty, bio } = req.body;
    try {
        await executeQuery('INSERT INTO Barbers (FullName, Specialty, Bio, IsActive) VALUES (@n, @s, @b, 1)', {
            n: fullName, s: specialty, b: bio
        });
        res.status(201).send('Barbero agregado');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
