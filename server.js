const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const USE_SQLITE = process.env.USE_SQLITE === 'true'; // Default to true for free demo

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Configurations
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourPassword123',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'BarberShop',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const sqliteDbPath = path.join(__dirname, 'barber.db');
let sqliteDb;

if (USE_SQLITE) {
    sqliteDb = new sqlite3.Database(sqliteDbPath);
    console.log('Using SQLite Database');
} else {
    console.log('Using SQL Server (mssql)');
}

// Unified Query Helper
async function executeQuery(query, params = {}) {
    if (USE_SQLITE) {
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
    } else {
        let pool = await sql.connect(dbConfig);
        let request = pool.request();
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        return await request.query(query);
    }
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

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
