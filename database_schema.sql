-- Create Database
-- CREATE DATABASE BarberShop;
-- GO

-- USE BarberShop;
-- GO

-- Table: Users (Customers & Admins)
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PhoneNumber NVARCHAR(20),
    PasswordHash NVARCHAR(MAX), -- Password for login
    UserRole NVARCHAR(20) DEFAULT 'Customer', -- Customer, Admin
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Table: Barbers (Workers)
CREATE TABLE Barbers (
    BarberId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Bio NVARCHAR(MAX),
    Specialty NVARCHAR(100),
    ProfileImageUrl NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Table: Availability Slots (Optional but helpful)
-- Table: Reservations
CREATE TABLE Reservations (
    ReservationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES Users(UserId),
    BarberId INT FOREIGN KEY REFERENCES Barbers(BarberId),
    ReservationTime DATETIME NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Pending', -- Pending, Confirmed, Cancelled, Completed
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Insert Sample Data
INSERT INTO Barbers (FullName, Bio, Specialty) VALUES 
('Marco Aurelio', 'Especialista en cortes clásicos y barba.', 'Cortes Clásicos'),
('Santiago Peña', 'Experto en degradados y estilos modernos.', 'Fades / Moderno'),
('Julian Castro', 'Más de 10 años de experiencia en diseño de barba.', 'Diseño de Barba');

-- Insert Initial Admin
INSERT INTO Users (FullName, Email, PasswordHash, UserRole) 
VALUES ('Administrador', 'admin@barbershop.com', 'admin123', 'Admin');
