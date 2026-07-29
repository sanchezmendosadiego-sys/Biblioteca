-- ==========================================================
-- SCRIPT COMPLETO DE BASE DE DATOS MARIADB / MYSQL
-- PROYECTO: SISTEMA DE BIBLIOTECA DIGITAL (BIBLIOTECH)
-- ==========================================================

-- 1. Crear Base de Datos
CREATE DATABASE IF NOT EXISTS `mi_biblioteca` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_spanish_ci;

USE `mi_biblioteca`;

-- 2. Tabla de Categorías de Libros
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_categoria` VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 3. Tabla de Usuarios y Lectores (Inicio de Sesión con Correo)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `usuario` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('Administrador', 'Lector') DEFAULT 'Lector',
  `telefono` VARCHAR(30) NULL,
  `fecha_registro` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 4. Tabla del Catálogo de Libros
CREATE TABLE IF NOT EXISTS `libros` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `autor` VARCHAR(150) NOT NULL,
  `isbn` VARCHAR(50) NULL,
  `categoria_id` INT NULL,
  `anio` INT DEFAULT 2024,
  `ejemplares_totales` INT DEFAULT 1,
  `ejemplares_disponibles` INT DEFAULT 1,
  `ubicacion` VARCHAR(100) DEFAULT 'Estante General',
  `portada` TEXT NULL,
  `descripcion` TEXT NULL,
  CONSTRAINT `fk_libro_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 5. Tabla de Préstamos de Libros
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

-- 6. Tabla de Historial de Actividad y Auditoría
CREATE TABLE IF NOT EXISTS `historial_registros` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NULL,
  `accion` VARCHAR(255) NOT NULL,
  `fecha_hora` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- ==========================================================
-- REGISTROS INICIALES DE DEMOSTRACIÓN
-- ==========================================================

-- Categorías por Defecto
INSERT INTO `categorias` (`id`, `nombre_categoria`) VALUES 
(1, 'Novela'),
(2, 'Clásico'),
(3, 'Fábula'),
(4, 'Ciencia Ficción'),
(5, 'Fantasía'),
(6, 'Historia'),
(7, 'Tecnología');

-- Usuarios Iniciales con Correo y Contraseña ('123')
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `usuario`, `password`, `rol`, `telefono`, `fecha_registro`) VALUES 
(1, 'Administrador', 'Principal', 'admin@biblioteca.com', 'admin', '$2y$10$e.w2ZgW3bK7a6iWc.Nn0O.bU9i8p8l8f8j8k8l8m8n8o8p8q8r8s', 'Administrador', '555-0100', '2026-01-15'),
(2, 'María', 'González', 'maria.g@gmail.com', 'maria.g', '$2y$10$e.w2ZgW3bK7a6iWc.Nn0O.bU9i8p8l8f8j8k8l8m8n8o8p8q8r8s', 'Lector', '555-0199', '2026-02-10'),
(3, 'Carlos', 'López', 'carlos.l@gmail.com', 'carlos.l', '$2y$10$e.w2ZgW3bK7a6iWc.Nn0O.bU9i8p8l8f8j8k8l8m8n8o8p8q8r8s', 'Lector', '555-0244', '2026-03-01'),
(4, 'Laura', 'Sánchez', 'laura.sanchez@gmail.com', 'laura.s', '$2y$10$e.w2ZgW3bK7a6iWc.Nn0O.bU9i8p8l8f8j8k8l8m8n8o8p8q8r8s', 'Lector', '555-0311', '2026-04-12');

-- Catálogo Inicial de 12 Libros
INSERT INTO `libros` (`id`, `titulo`, `autor`, `isbn`, `categoria_id`, `anio`, `ejemplares_totales`, `ejemplares_disponibles`, `ubicacion`, `portada`, `descripcion`) VALUES 
(1, 'Cien Años de Soledad', 'Gabriel García Márquez', '978-0307474728', 1, 1967, 5, 3, 'Estante A-12', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', 'Obra maestra del realismo mágico.'),
(2, 'Don Quijote de la Mancha', 'Miguel de Cervantes', '978-8424116286', 2, 1605, 4, 2, 'Estante B-04', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', 'Aventuras del hidalgo Don Quijote y Sancho Panza.'),
(3, 'El Principito', 'Antoine de Saint-Exupéry', '978-0156012195', 3, 1943, 8, 7, 'Estante C-01', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80', 'Cuento poético sobre el amor y la amistad.'),
(4, '1984', 'George Orwell', '978-0451524935', 4, 1949, 6, 5, 'Estante A-08', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80', 'Novela distópica sobre el Gran Hermano.'),
(5, 'El Señor de los Anillos: La Comunidad del Anillo', 'J.R.R. Tolkien', '978-8445071410', 5, 1954, 5, 4, 'Estante F-01', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80', 'Epopeya fantástica en la Tierra Media.'),
(6, 'Fahrenheit 451', 'Ray Bradbury', '978-8445074398', 4, 1953, 4, 3, 'Estante A-09', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80', 'Sociedad futurista donde los libros están prohibidos.'),
(7, 'Rayuela', 'Julio Cortázar', '978-8437604572', 1, 1963, 3, 3, 'Estante A-15', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80', 'Obra cumbre de la literatura hispanoamericana.'),
(8, 'Crónica de una Muerte Anunciada', 'Gabriel García Márquez', '978-8497592437', 1, 1981, 5, 4, 'Estante A-14', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80', 'Reconstrucción del asesinato de Santiago Nasar.'),
(9, 'Orgullo y Prejuicio', 'Jane Austen', '978-8497940733', 2, 1813, 4, 3, 'Estante B-10', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', 'Historia de amor entre Elizabeth Bennet y Darcy.'),
(10, 'Hábitos Atómicos', 'James Clear', '978-6070766947', 7, 2018, 7, 6, 'Estante D-02', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80', 'Cambios pequeños para resultados extraordinarios.'),
(11, 'El Alquimista', 'Paulo Coelho', '978-0062511409', 3, 1988, 6, 5, 'Estante C-05', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', 'Viaje del joven pastor Santiago por su Leyenda Personal.'),
(12, 'Steve Jobs', 'Walter Isaacson', '978-8499893549', 7, 2011, 4, 3, 'Estante T-01', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', 'La biografía del fundador de Apple.');

-- Préstamos Iniciales de Prueba
INSERT INTO `prestamos` (`id`, `libro_id`, `usuario_id`, `fecha_prestamo`, `fecha_devolucion_estimada`, `fecha_devolucion_real`, `estado`, `notas`) VALUES 
(1, 1, 2, '2026-07-15', '2026-07-29', NULL, 'Activo', 'Préstamo de prueba'),
(2, 2, 3, '2026-07-10', '2026-07-24', NULL, 'Vencido', 'Notificación enviada');
