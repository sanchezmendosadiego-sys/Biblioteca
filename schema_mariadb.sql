-- ==========================================================
-- SCRIPT DE BASE DE DATOS MARIADB / MYSQL
-- PROYECTO: SISTEMA DE BIBLIOTECA DIGITAL (BIBLIOTECH)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `mi_biblioteca` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_spanish_ci;

USE `mi_biblioteca`;

-- 1. Tabla USUARIOS (Exactamente 7 campos)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('Administrador', 'Lector') DEFAULT 'Lector',
  `telefono` VARCHAR(30) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 2. Tabla LIBROS (Exactamente 8 campos)
CREATE TABLE IF NOT EXISTS `libros` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `autor` VARCHAR(150) NOT NULL,
  `categoria` VARCHAR(80) NOT NULL DEFAULT 'Novela',
  `isbn` VARCHAR(50) NULL,
  `ejemplares_totales` INT DEFAULT 1,
  `ejemplares_disponibles` INT DEFAULT 1,
  `ubicacion` VARCHAR(100) DEFAULT 'Estante General'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 3. Tabla PRESTAMOS (Exactamente 6 campos)
CREATE TABLE IF NOT EXISTS `prestamos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `libro_id` INT NOT NULL,
  `fecha_prestamo` DATE NOT NULL,
  `fecha_devolucion` DATE NOT NULL,
  `estado` ENUM('Activo', 'Devuelto', 'Vencido') DEFAULT 'Activo',
  CONSTRAINT `fk_prestamo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prestamo_libro` FOREIGN KEY (`libro_id`) REFERENCES `libros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- REGISTROS INICIALES
INSERT INTO `usuarios` (`id`, `email`, `nombre`, `apellido`, `password`, `rol`, `telefono`) VALUES 
(1, 'admin@biblioteca.com', 'Administrador', 'Principal', '123', 'Administrador', '555-0100'),
(2, 'maria.g@gmail.com', 'María', 'González', '123', 'Lector', '555-0199');

INSERT INTO `libros` (`id`, `titulo`, `autor`, `categoria`, `isbn`, `ejemplares_totales`, `ejemplares_disponibles`, `ubicacion`) VALUES 
(1, 'Cien Años de Soledad', 'Gabriel García Márquez', 'Novela', '978-0307474728', 5, 4, 'Estante A-12'),
(2, 'Don Quijote de la Mancha', 'Miguel de Cervantes', 'Clásico', '978-8424116286', 3, 3, 'Estante B-04');

INSERT INTO `prestamos` (`id`, `usuario_id`, `libro_id`, `fecha_prestamo`, `fecha_devolucion`, `estado`) VALUES
(1, 2, 1, '2026-07-15', '2026-07-29', 'Activo');
