<?php
/**
 * conexion_mariadb.php
 * Conexión segura a MariaDB / MySQL utilizando PHP PDO
 * Incluye auto-creación de Base de Datos, Tablas y manejo de errores.
 */

// Parámetros de Configuración de MariaDB
$db_host = "localhost";
$db_port = "3306";
$db_user = "root";       // Usuario por defecto en MariaDB / XAMPP / Ubuntu
$db_pass = "";           // Contraseña de tu servidor MariaDB (déjalo vacío si no tiene)
$db_name = "mi_biblioteca";
$db_charset = "utf8mb4";

try {
    // 1. Conexión inicial a MariaDB (sin especificar BD para verificar su existencia)
    $dsn_setup = "mysql:host=$db_host;port=$db_port;charset=$db_charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $pdo_setup = new PDO($dsn_setup, $db_user, $db_pass, $options);

    // 2. Crear la Base de Datos 'mi_biblioteca' si no existe
    $pdo_setup->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;");

    // 3. Conexión definitiva a la Base de Datos 'mi_biblioteca'
    $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=$db_charset";
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);

    // 4. Crear automáticamente las tablas si es la primera vez que corre
    crearEstructuraTablasMariaDB($pdo);

} catch (PDOException $e) {
    // Manejo de error si MariaDB no está iniciado
    die("<h1>❌ Error de Conexión a MariaDB</h1>
         <p><strong>Detalle del Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>
         <p>Asegúrate de que el servicio de MariaDB / MySQL esté encendido en tu servidor.</p>");
}

/**
 * Función auxiliar para generar las tablas requeridas en MariaDB
 */
function crearEstructuraTablasMariaDB($pdo) {
    // Tabla 1: Categorías
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `categorias` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `nombre_categoria` VARCHAR(80) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
    ");

    // Tabla 2: Usuarios / Lectores / Administradores
    $pdo->exec("
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
    ");

    // Tabla 3: Catálogo de Libros
    $pdo->exec("
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
    ");

    // Tabla 4: Préstamos de Libros
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
            CONSTRAINT `fk_prestamo_libro` FOREIGN KEY (`libro_id`) REFERENCES `libros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT `fk_prestamo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
    ");

    // Tabla 5: Historial de Registros y Auditoría
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `historial_registros` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `usuario_id` INT NULL,
            `accion` VARCHAR(255) NOT NULL,
            `fecha_hora` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
    ");

    // Insertar categorías iniciales si está vacía
    $checkCat = $pdo->query("SELECT COUNT(*) FROM `categorias`")->fetchColumn();
    if ($checkCat == 0) {
        $pdo->exec("INSERT INTO `categorias` (`nombre_categoria`) VALUES 
            ('Novela'), ('Clásico'), ('Fábula'), ('Ciencia Ficción'), ('Fantasía'), ('Historia'), ('Tecnología');");
    }

    // Insertar Administrador principal por defecto si no existen usuarios
    $checkUser = $pdo->query("SELECT COUNT(*) FROM `usuarios`")->fetchColumn();
    if ($checkUser == 0) {
        $passHash = password_hash('123', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO `usuarios` (`nombre`, `apellido`, `email`, `usuario`, `password`, `rol`, `fecha_registro`) 
            VALUES ('Administrador', 'Principal', 'admin@biblioteca.com', 'admin', '$passHash', 'Administrador', CURDATE());");
    }
}
?>
