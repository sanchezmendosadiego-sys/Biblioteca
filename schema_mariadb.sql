-- ==========================================================
-- SCRIPT DE BASE DE DATOS MARIADB / MYSQL (8 CAMPOS POR TABLA)
-- PROYECTO: SISTEMA DE BIBLIOTECA DIGITAL (BIBLIOTECH)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `mi_biblioteca` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_spanish_ci;

USE `mi_biblioteca`;

-- 1. Tabla USUARIOS (Exactamente 8 campos)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `usuario` VARCHAR(50) NOT NULL UNIQUE,
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

-- 3. Tabla PRESTAMOS (Exactamente 8 campos)
CREATE TABLE IF NOT EXISTS `prestamos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `libro_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `fecha_prestamo` DATE NOT NULL,
  `fecha_devolucion_estimada` DATE NOT NULL,
  `fecha_devolucion_real` DATE NULL,
  `estado` ENUM('Activo', 'Devuelto', 'Vencido') DEFAULT 'Activo',
  `notas` TEXT NULL,
  CONSTRAINT `fk_prestamo_libro` FOREIGN KEY (`libro_id`) REFERENCES `libros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prestamo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- REGISTROS INICIALES
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `usuario`, `password`, `rol`, `telefono`) VALUES 
(1, 'Administrador', 'Principal', 'admin@biblioteca.com', 'admin', '123', 'Administrador', '555-0100'),
(2, 'María', 'González', 'maria.g@gmail.com', 'maria.g', '123', 'Lector', '555-0199');

INSERT INTO `libros` (`id`, `titulo`, `autor`, `categoria`, `isbn`, `ejemplares_totales`, `ejemplares_disponibles`, `ubicacion`) VALUES 
(1, 'Cien Años de Soledad', 'Gabriel García Márquez', 'Novela', '978-0307474728', 5, 4, 'Estante A-12'),
(2, 'Don Quijote de la Mancha', 'Miguel de Cervantes', 'Clásico', '978-8424116286', 3, 3, 'Estante B-04');
