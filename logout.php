<?php
// logout.php - Destruir sesión y redirigir a login
session_start();
session_unset();
session_destroy();
header("Location: login.php");
exit();
?>
