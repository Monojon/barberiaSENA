const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./barber.db');

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        UserId INTEGER PRIMARY KEY AUTOINCREMENT,
        FullName TEXT NOT NULL,
        Email TEXT UNIQUE NOT NULL,
        PasswordHash TEXT NOT NULL,
        UserRole TEXT DEFAULT 'Customer',
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Barbers Table
    db.run(`CREATE TABLE IF NOT EXISTS Barbers (
        BarberId INTEGER PRIMARY KEY AUTOINCREMENT,
        FullName TEXT NOT NULL,
        Bio TEXT,
        Specialty TEXT,
        ImageUrl TEXT,
        IsActive BOOLEAN DEFAULT 1
    )`);

    // Reservations Table
    db.run(`CREATE TABLE IF NOT EXISTS Reservations (
        ReservationId INTEGER PRIMARY KEY AUTOINCREMENT,
        UserId INTEGER,
        BarberId INTEGER,
        ReservationTime DATETIME NOT NULL,
        Status TEXT DEFAULT 'Pending',
        Notes TEXT,
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        FOREIGN KEY (BarberId) REFERENCES Barbers(BarberId)
    )`);

    // Seed Data: Default Admin
    db.run(`INSERT OR IGNORE INTO Users (FullName, Email, PasswordHash, UserRole) 
            VALUES ('Admin Barbershop', 'admin@barbershop.com', 'admin123', 'Admin')`);

    // Seed Data: Barbers
    db.run(`INSERT OR IGNORE INTO Barbers (FullName, Specialty, Bio, ImageUrl) VALUES 
        ('Marco Aurelio', 'Cortes Clásicos', 'Especialista en cortes clásicos y barba.', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
        ('Santiago Peña', 'Fades / Moderno', 'Experto en degradados y estilos modernos.', 'https://images.unsplash.com/photo-1599351431247-f10b21ce5639?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
        ('Julian Castro', 'Diseño de Barba', 'Más de 10 años de experiencia en diseño de barba.', 'https://images.unsplash.com/photo-1621605815841-aa88c8247a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')
    `);

    console.log("Database SQLite 'barber.db' initialized successfully.");
});

db.close();
