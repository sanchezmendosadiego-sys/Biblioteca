<?php
/**
 * conexion_mariadb.php
 * Conexión a MariaDB / MySQL con esquema oficial de 8 CAMPOS EXACTOS por tabla.
 */

$db_host = "localhost";
$db_port = "3306";
$db_user = "root";
$db_pass = "";
$db_name = "mi_biblioteca";
$db_charset = "utf8mb4";

try {
    $dsn_setup = "mysql:host=$db_host;port=$db_port;charset=$db_charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $pdo_setup = new PDO($dsn_setup, $db_user, $db_pass, $options);
    $pdo_setup->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;");

    $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=$db_charset";
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);

    crearEstructuraTablasMariaDB($pdo);

} catch (PDOException $e) {
    die("<h1>❌ Error de Conexión a MariaDB</h1><p>" . htmlspecialchars($e->getMessage()) . "</p>");
}

function crearEstructuraTablasMariaDB($pdo) {
    // 1. Tabla USUARIOS (8 campos exactos)
    $pdo->exec("
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
    ");

    // 2. Tabla LIBROS (8 campos exactos)
    $pdo->exec("
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
    ");

    // 3. Tabla PRESTAMOS (8 campos exactos)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `prestamos` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `libro_id` INT NOT NULL,
            `usuario_id` INT NOT NULL,
            `fecha_prestamo` DATE NOT NULL,
            `fecha_devolucion_estimada` DATE NOT NULL,
            `fecha_devolucion_real` DATE NULL,
            `estado` ENUM('Activo', 'Devuelto', 'Vencido') DEFAULT 'Activo',
            `notas` TEXT NULL,
            CONSTRAINT `fk_prestamo_libro` FOREIGN KEY (`libro_id`) REFERENCES `libros`(`id`) ON DELETE CASCADE,
            CONSTRAINT `fk_prestamo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
    ");

    // Insertar registros por defecto si la base de datos está limpia
    $checkUser = $pdo->query("SELECT COUNT(*) FROM `usuarios`")->fetchColumn();
    if ($checkUser == 0) {
        $passHash = password_hash('123', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO `usuarios` (`nombre`, `apellido`, `email`, `usuario`, `password`, `rol`, `telefono`) 
            VALUES ('Administrador', 'Principal', 'admin@biblioteca.com', 'admin', '$passHash', 'Administrador', '555-0100');");
    }

    $checkBooks = $pdo->query("SELECT COUNT(*) FROM `libros`")->fetchColumn();
    if ($checkBooks == 0) {
        $pdo->exec("INSERT INTO `libros` (`titulo`, `autor`, `categoria`, `isbn`, `ejemplares_totales`, `ejemplares_disponibles`, `ubicacion`) VALUES
            ('Cien Años de Soledad', 'Gabriel García Márquez', 'Novela', '978-0307474728', 5, 4, 'Estante A-12'),
            ('Don Quijote de la Mancha', 'Miguel de Cervantes', 'Clásico', '978-8424116286', 3, 3, 'Estante B-04'),
            ('El Principito', 'Antoine de Saint-Exupéry', 'Fábula', '978-0156012195', 8, 7, 'Estante C-01'),
            ('1984', 'George Orwell', 'Ciencia Ficción', '978-0451524935', 4, 4, 'Estante A-08');");
    }
}
?>
