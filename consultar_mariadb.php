<?php
/**
 * consultar_mariadb.php
 * Script CLI para consultar la estructura y registros de MariaDB desde PowerShell
 */

require_once __DIR__ . '/conexion_mariadb.php';

$tabla = $argv[1] ?? 'todas';

// Asegurar que la tabla sea válida
$tablasValidas = ['usuarios', 'libros', 'prestamos', 'categorias', 'historial_registros'];

if ($tabla === 'todas') {
    echo "=====================================================\n";
    echo "  TABLAS DISPONIBLES EN MARIADB (mi_biblioteca)\n";
    echo "=====================================================\n";
    echo "Uso: php consultar_mariadb.php <nombre_tabla>\n";
    echo "Ejemplos:\n";
    echo "  php consultar_mariadb.php libros\n";
    echo "  php consultar_mariadb.php usuarios\n";
    echo "  php consultar_mariadb.php prestamos\n";
    echo "  php consultar_mariadb.php categorias\n\n";

    $stmt = $pdo->query("SHOW TABLES");
    $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tablas as $t) {
        echo " 📌 Tabla: $t\n";
    }
    echo "=====================================================\n";
    exit();
}

if (!in_array(strtolower($tabla), $tablasValidas)) {
    echo "❌ Tabla '$tabla' no encontrada.\n";
    echo "Tablas disponibles: " . implode(', ', $tablasValidas) . "\n";
    exit();
}

$tabla = strtolower($tabla);

echo "=====================================================\n";
echo "  ESTRUCTURA EN MARIADB DE LA TABLA: '$tabla'\n";
echo "=====================================================\n";
printf("%-20s | %-20s | %-6s | %-4s | %-10s\n", "Campo (Field)", "Tipo (Type)", "Null", "Key", "Default");
echo str_repeat("-", 70) . "\n";

$desc = $pdo->query("DESCRIBE `$tabla`")->fetchAll();
foreach ($desc as $col) {
    printf("%-20s | %-20s | %-6s | %-4s | %-10s\n", 
        $col['Field'], 
        $col['Type'], 
        $col['Null'], 
        $col['Key'], 
        $col['Default'] ?? 'NULL'
    );
}

echo "\n=====================================================\n";
echo "  REGISTROS GUARDADOS EN MARIADB (SELECT * FROM $tabla)\n";
echo "=====================================================\n";

$rows = $pdo->query("SELECT * FROM `$tabla` LIMIT 10")->fetchAll();
if (empty($rows)) {
    echo "No hay registros actualmente en la tabla '$tabla'.\n";
} else {
    // Imprimir llaves
    $keys = array_keys($rows[0]);
    echo implode(" | ", array_map(fn($k) => strtoupper($k), $keys)) . "\n";
    echo str_repeat("-", 80) . "\n";
    foreach ($rows as $row) {
        $vals = array_map(function($v) {
            $str = (string)$v;
            return strlen($str) > 25 ? substr($str, 0, 22) . '...' : $str;
        }, array_values($row));
        echo implode(" | ", $vals) . "\n";
    }
}
echo "=====================================================\n";
?>
