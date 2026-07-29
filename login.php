<?php
// login.php - Autenticación con Correo y Contraseña
session_start();
require_once 'conexion.php';

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo_o_usuario = trim($_POST['email'] ?? $_POST['usuario'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!empty($correo_o_usuario) && !empty($password)) {
        if (isset($pdo)) {
            // Consulta en MySQL
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :val OR usuario = :val LIMIT 1");
            $stmt->execute(['val' => $correo_o_usuario]);
            $user = $stmt->fetch();

            if ($user && ($password === $user['password'] || password_verify($password, $user['password']))) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['nombre'] . ' ' . $user['apellido'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_role'] = $user['rol'];

                header("Location: dashboard.php");
                exit();
            } else {
                $error = "Correo o contraseña incorrectos.";
            }
        } else {
            // Fallback credenciales rápidas
            if (($correo_o_usuario === 'admin@biblioteca.com' || $correo_o_usuario === 'admin') && $password === '123') {
                $_SESSION['user_id'] = 1;
                $_SESSION['user_name'] = 'Administrador';
                $_SESSION['user_email'] = 'admin@biblioteca.com';
                $_SESSION['user_role'] = 'Administrador';

                header("Location: dashboard.php");
                exit();
            } else {
                $error = "Correo o contraseña incorrectos.";
            }
        }
    } else {
        $error = "Por favor completa todos los campos.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Biblioteca Digital PHP</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="public/style.css">
</head>
<body style="display:flex; align-items:center; justify-content:center; min-height:100vh;">
    <div class="glass-card modal-sm" style="width:100%; max-width:400px; padding:2rem;">
        <div class="text-center mb-4">
            <div class="brand-icon mx-auto mb-2"><i class="fa-solid fa-book-bookmark"></i></div>
            <h2>Acceso a <span class="gradient-text">BiblioTech (PHP)</span></h2>
            <p>Inicia sesión con tu **Correo Electrónico**</p>
        </div>

        <?php if (!empty($error)): ?>
            <div style="background:rgba(244,63,94,0.2); color:#f43f5e; padding:0.6rem; border-radius:8px; margin-bottom:1rem; font-size:0.85rem; text-align:center;">
                <i class="fa-solid fa-circle-exclamation"></i> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <div class="demo-users-bar mb-3">
            <small>Cuenta rápida de prueba:</small>
            <div class="flex-gap-sm mt-1">
                <button type="button" class="chip chip-admin" onclick="document.getElementById('emailInput').value='admin@biblioteca.com'; document.getElementById('passInput').value='123';">
                    <i class="fa-solid fa-user-shield"></i> admin@biblioteca.com (123)
                </button>
            </div>
        </div>

        <form action="login.php" method="POST">
            <div class="form-group">
                <label><i class="fa-solid fa-envelope"></i> Correo Electrónico</label>
                <input type="email" id="emailInput" name="email" required placeholder="admin@biblioteca.com" value="admin@biblioteca.com">
            </div>
            <div class="form-group">
                <label><i class="fa-solid fa-key"></i> Contraseña</label>
                <input type="password" id="passInput" name="password" required value="123">
            </div>
            <button type="submit" class="btn btn-primary btn-block mt-3">
                <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión en PHP
            </button>
        </form>
    </div>
</body>
</html>
