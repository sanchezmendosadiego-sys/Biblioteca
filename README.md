# 📚 Sistema de Gestión de Biblioteca Digital (BiblioTech)

Sistema integral de gestión de catálogo de libros, préstamos, usuarios y diagrama de arquitectura estilo Lucidchart. Soporta servidores **Node.js** y **PHP + MySQL**.

---

## 🌟 Características Principales

- **🔐 Autenticación por Correo Electrónico:** Inicio de sesión seguro con correo y contraseña.
- **📚 Catálogo de Libros:** Búsqueda en tiempo real, filtros por categoría y disponibilidad, vista en tarjetas y tabla.
- **📑 Gestión de Préstamos:** Registro de entregas, fechas límite y devoluciones con control de inventario en tiempo real.
- **👥 Directorio de Usuarios y Correos:** Persistencia de cuentas de usuario y opción de exportar datos en JSON.
- **📐 Mapa Interactivo Lucidchart:** Visualizador integrado de Diagramas de Casos de Uso, Modelo Entidad-Relación (ERD) y Flujo de Datos.

---

## 🚀 Cómo Ejecutar la Aplicación

### Opción 1: Con Node.js (Sin dependencias externas)
1. Navega a la carpeta del proyecto:
   ```bash
   cd biblioteca_digital
   ```
2. Inicia el servidor:
   ```bash
   node server.js
   ```
3. Abre en tu navegador: `http://localhost:3000`

---

### Opción 2: Con PHP (Apache / XAMPP / Ubuntu)
1. Copia el directorio `biblioteca_digital` en la carpeta servidor (`htdocs` o `/var/www/html/`).
2. Importa el archivo `schema.sql` en tu base de datos MySQL / phpMyAdmin.
3. Abre en tu navegador: `http://localhost/biblioteca_digital/login.php`

---

## 🔑 Credenciales de Prueba
- **Correo:** `admin@biblioteca.com`
- **Contraseña:** `123`
