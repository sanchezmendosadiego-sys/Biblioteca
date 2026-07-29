<?php
// conexion.php - Conexión segura a la Base de Datos con manejo de errores

$host = "localhost";
$user = "root";
$pass = ""; // O la contraseña de tu MySQL/MariaDB
$db_name = "mi_biblioteca";

try {
    // Intentar conectar a MySQL usando PDO
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Crear la base de datos si no existe
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$db_name`;");

    // Crear tablas básicas si no existen
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            usuario VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'Lector',
            telefono VARCHAR(30),
            fecha_registro DATE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS libros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            autor VARCHAR(150) NOT NULL,
            isbn VARCHAR(50),
            categoria VARCHAR(80) DEFAULT 'Novela',
            anio INT DEFAULT 2024,
            ejemplares_totales INT DEFAULT 1,
            ejemplares_disponibles INT DEFAULT 1,
            ubicacion VARCHAR(100),
            portada TEXT,
            descripcion TEXT
        );

        CREATE TABLE IF NOT EXISTS prestamos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            libro_id INT NOT NULL,
            usuario_id INT NOT NULL,
            fecha_prestamo DATE NOT NULL,
            fecha_devolucion_estimada DATE NOT NULL,
            fecha_devolucion_real DATE NULL,
            estado VARCHAR(50) DEFAULT 'Activo',
            notas TEXT,
            FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
    ");

    // Insertar admin por defecto si la tabla está vacía
    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO usuarios (nombre, apellido, email, usuario, password, rol, fecha_registro) 
                    VALUES ('Administrador', 'Principal', 'admin@biblioteca.com', 'admin', '123', 'Administrador', CURDATE())");
    }

} catch (PDOException $e) {
    // Si falla la conexión a MySQL, la app no colapsa
    $conexion_error = "Nota: Servidor MySQL no detectado. (" . $e->getMessage() . ")";
}
?>
