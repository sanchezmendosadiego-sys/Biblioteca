-- schema.sql - Script de creación de Base de Datos mi_biblioteca
CREATE DATABASE IF NOT EXISTS `mi_biblioteca` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mi_biblioteca`;

-- Tabla de Usuarios (Guarda correos, usuarios y contraseñas)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `usuario` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` VARCHAR(50) DEFAULT 'Lector',
  `telefono` VARCHAR(30),
  `fecha_registro` DATE NOT NULL
);

-- Tabla de Libros
CREATE TABLE IF NOT EXISTS `libros` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `autor` VARCHAR(150) NOT NULL,
  `isbn` VARCHAR(50),
  `categoria` VARCHAR(80) DEFAULT 'Novela',
  `anio` INT DEFAULT 2024,
  `ejemplares_totales` INT DEFAULT 1,
  `ejemplares_disponibles` INT DEFAULT 1,
  `ubicacion` VARCHAR(100),
  `portada` TEXT,
  `descripcion` TEXT
);

-- Tabla de Préstamos
CREATE TABLE IF NOT EXISTS `prestamos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `libro_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `fecha_prestamo` DATE NOT NULL,
  `fecha_devolucion_estimada` DATE NOT NULL,
  `fecha_devolucion_real` DATE NULL,
  `estado` VARCHAR(50) DEFAULT 'Activo',
  `notas` TEXT,
  FOREIGN KEY (`libro_id`) REFERENCES `libros`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Datos iniciales de prueba
INSERT INTO `usuarios` (`nombre`, `apellido`, `email`, `usuario`, `password`, `rol`, `fecha_registro`) 
VALUES ('Administrador', 'Principal', 'admin@biblioteca.com', 'admin', '123', 'Administrador', CURDATE());

INSERT INTO `libros` (`titulo`, `autor`, `isbn`, `categoria`, `anio`, `ejemplares_totales`, `ejemplares_disponibles`, `ubicacion`, `portada`) 
VALUES 
('Cien Años de Soledad', 'Gabriel García Márquez', '978-0307474728', 'Novela', 1967, 5, 4, 'Estante A-12', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'),
('Don Quijote de la Mancha', 'Miguel de Cervantes', '978-8424116286', 'Clásico', 1605, 3, 2, 'Estante B-04', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80');
