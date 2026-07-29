<?php
// dashboard.php - Panel Principal en PHP
session_start();
require_once 'conexion.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$userName = $_SESSION['user_name'] ?? 'Usuario';
$userEmail = $_SESSION['user_email'] ?? 'correo@biblioteca.com';
$userRole = $_SESSION['user_role'] ?? 'Lector';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BiblioTech - Dashboard PHP & Lucidchart</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="public/style.css">
</head>
<body>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">
          <i class="fa-solid fa-book-bookmark"></i>
        </div>
        <div class="brand-text">
          <h2>Biblio<span>Tech</span></h2>
          <small>Servidor PHP Activo</small>
        </div>
      </div>

      <nav class="nav-menu">
        <a href="#dashboard" class="nav-item active" data-tab="dashboard">
          <i class="fa-solid fa-chart-pie"></i>
          <span>Panel Principal</span>
        </a>
        <a href="#catalogo" class="nav-item" data-tab="catalogo">
          <i class="fa-solid fa-books"></i>
          <span>Catálogo de Libros</span>
        </a>
        <a href="#prestamos" class="nav-item" data-tab="prestamos">
          <i class="fa-solid fa-hand-holding-hand"></i>
          <span>Préstamos</span>
        </a>
        <a href="#usuarios" class="nav-item" data-tab="usuarios">
          <i class="fa-solid fa-users"></i>
          <span>Usuarios / Correos</span>
        </a>
        <a href="#lucidchart" class="nav-item" data-tab="lucidchart">
          <i class="fa-solid fa-diagram-project text-lucid-orange"></i>
          <span>Mapa Lucidchart</span>
        </a>
        <a href="#reportes" class="nav-item" data-tab="reportes">
          <i class="fa-solid fa-file-invoice"></i>
          <span>Reportes</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card" id="userProfileCard">
          <div class="user-avatar"><?= strtoupper($userName[0] ?? 'U') ?></div>
          <div class="user-info">
            <span class="user-name"><?= htmlspecialchars($userEmail) ?></span>
            <span class="user-role"><?= htmlspecialchars($userRole) ?></span>
          </div>
          <a href="logout.php" class="btn-icon" title="Cerrar Sesión">
            <i class="fa-solid fa-right-from-bracket"></i>
          </a>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <header class="top-header">
        <div class="search-global">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="globalSearchInput" placeholder="Buscar por título, autor, correo o ISBN...">
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" id="btnQuickLoan">
            <i class="fa-solid fa-plus"></i> Nuevo Préstamo
          </button>
          <button class="btn btn-primary" id="btnQuickAddBook">
            <i class="fa-solid fa-book"></i> Agregar Libro
          </button>
        </div>
      </header>

      <div class="content-body">
        
        <!-- DASHBOARD TAB -->
        <section id="tab-dashboard" class="tab-content active">
          <div class="welcome-banner">
            <div class="welcome-text">
              <h1>¡Sesión Iniciada con <span class="gradient-text"><?= htmlspecialchars($userEmail) ?></span>!</h1>
              <p>Sistema PHP + MySQL / JSON con persistencia completa y visualización estilo Lucidchart.</p>
            </div>
            <div class="welcome-badge">
              <i class="fa-solid fa-circle-check"></i> PHP 8 / MySQL Conectado
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon purple"><i class="fa-solid fa-book"></i></div>
              <div class="stat-data">
                <h3 id="statTotalTitulos">0</h3>
                <p>Títulos en Catálogo</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon blue"><i class="fa-solid fa-layer-group"></i></div>
              <div class="stat-data">
                <h3 id="statTotalEjemplares">0</h3>
                <p>Total de Ejemplares</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green"><i class="fa-solid fa-handshake"></i></div>
              <div class="stat-data">
                <h3 id="statPrestamosActivos">0</h3>
                <p>Préstamos Activos</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange"><i class="fa-solid fa-envelope"></i></div>
              <div class="stat-data">
                <h3 id="statTotalLectores">0</h3>
                <p>Correos / Usuarios</p>
              </div>
            </div>
          </div>

          <div class="dashboard-grid">
            <div class="glass-card">
              <div class="card-header">
                <h3><i class="fa-solid fa-star text-gold"></i> Libros Recientes</h3>
                <button class="btn-link" onclick="switchTab('catalogo')">Ver todos</button>
              </div>
              <div class="recent-books-grid" id="recentBooksGrid"></div>
            </div>

            <div class="glass-card">
              <div class="card-header">
                <h3><i class="fa-solid fa-clock-rotate-left"></i> Préstamos en Curso</h3>
                <button class="btn-link" onclick="switchTab('prestamos')">Ver todos</button>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Libro</th>
                      <th>Lector / Correo</th>
                      <th>Devolución</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody id="dashboardLoansTable"></tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- CATALOG TAB -->
        <section id="tab-catalogo" class="tab-content">
          <div class="section-header">
            <div>
              <h2>Catálogo de Libros</h2>
              <p>Administra el inventario de la biblioteca digital.</p>
            </div>
            <button class="btn btn-primary" onclick="openBookModal()">
              <i class="fa-solid fa-plus"></i> Registrar Libro
            </button>
          </div>

          <div class="filter-bar">
            <div class="filter-group">
              <label>Categoría:</label>
              <select id="filterCategory">
                <option value="ALL">Todas las Categorías</option>
                <option value="Novela">Novela</option>
                <option value="Clásico">Clásico</option>
                <option value="Fábula">Fábula</option>
                <option value="Ciencia Ficción">Ciencia Ficción</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Disponibilidad:</label>
              <select id="filterAvailability">
                <option value="ALL">Todos</option>
                <option value="DISPONIBLE">Disponibles</option>
                <option value="AGOTADO">Agotados</option>
              </select>
            </div>
            <div class="view-toggle">
              <button class="btn-icon active" id="btnGridView"><i class="fa-solid fa-grid-2"></i></button>
              <button class="btn-icon" id="btnTableView"><i class="fa-solid fa-list"></i></button>
            </div>
          </div>

          <div id="catalogGrid" class="books-cards-grid"></div>

          <div id="catalogTableContainer" class="glass-card table-responsive" style="display:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Portada</th>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Categoría</th>
                  <th>ISBN</th>
                  <th>Disponibles</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="catalogTableBody"></tbody>
            </table>
          </div>
        </section>

        <!-- LOANS TAB -->
        <section id="tab-prestamos" class="tab-content">
          <div class="section-header">
            <div>
              <h2>Gestión de Préstamos</h2>
              <p>Registro de préstamos activos, fechas límite y devoluciones.</p>
            </div>
            <button class="btn btn-primary" onclick="openLoanModal()">
              <i class="fa-solid fa-hand-holding-hand"></i> Nuevo Préstamo
            </button>
          </div>

          <div class="glass-card table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Libro</th>
                  <th>Usuario / Correo</th>
                  <th>F. Préstamo</th>
                  <th>F. Límite</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="loansTableBody"></tbody>
            </table>
          </div>
        </section>

        <!-- USERS TAB -->
        <section id="tab-usuarios" class="tab-content">
          <div class="section-header">
            <div>
              <h2>Directorio de Correos y Usuarios</h2>
              <p>Control de correos electrónicos guardados y perfiles.</p>
            </div>
            <div class="flex-gap">
              <button class="btn btn-secondary" onclick="exportDataJSON()">
                <i class="fa-solid fa-download"></i> Exportar BD (JSON)
              </button>
              <button class="btn btn-primary" onclick="openUserModal()">
                <i class="fa-solid fa-user-plus"></i> Registrar Usuario / Correo
              </button>
            </div>
          </div>

          <div class="glass-card table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico (Login)</th>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody id="usersTableBody"></tbody>
            </table>
          </div>
        </section>

        <!-- LUCIDCHART TAB -->
        <section id="tab-lucidchart" class="tab-content">
          <div class="section-header">
            <div>
              <h2><i class="fa-solid fa-diagram-project text-lucid-orange"></i> Arquitectura Lucidchart del Sistema</h2>
              <p>Diagrama visual interactivo de casos de uso, relaciones ERD y flujo de datos.</p>
            </div>
            <div class="diagram-controls">
              <button class="btn btn-secondary active" id="btnDiagUseCase" onclick="switchDiagramView('usecase')">
                <i class="fa-solid fa-users-gear"></i> Casos de Uso
              </button>
              <button class="btn btn-secondary" id="btnDiagERD" onclick="switchDiagramView('erd')">
                <i class="fa-solid fa-database"></i> Modelo ERD
              </button>
              <button class="btn btn-secondary" id="btnDiagFlow" onclick="switchDiagramView('flow')">
                <i class="fa-solid fa-route"></i> Flujo de Préstamo
              </button>
            </div>
          </div>

          <div class="lucid-canvas-wrapper glass-card">
            <div class="lucid-toolbar">
              <div class="lucid-brand">
                <span class="lucid-badge"><i class="fa-solid fa-shapes"></i> Canvas Lucidchart</span>
                <small id="diagramCurrentTitle">Diagrama de Casos de Uso - Biblioteca Digital</small>
              </div>
              <div class="lucid-actions">
                <button class="btn-icon" title="Acercar" onclick="zoomDiagram(1.1)"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
                <button class="btn-icon" title="Alejar" onclick="zoomDiagram(0.9)"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
                <button class="btn-icon" title="Restablecer" onclick="resetDiagramZoom()"><i class="fa-solid fa-arrows-rotate"></i></button>
              </div>
            </div>

            <div class="lucid-diagram-viewport" id="lucidViewport"></div>

            <div class="lucid-legend">
              <span class="leg-item"><span class="leg-dot orange"></span> Actores / Usuarios</span>
              <span class="leg-item"><span class="leg-dot blue"></span> Casos de Uso / Procesos</span>
              <span class="leg-item"><span class="leg-dot green"></span> Base de Datos Persistente</span>
            </div>
          </div>
        </section>

        <!-- REPORTES TAB -->
        <section id="tab-reportes" class="tab-content">
          <div class="section-header">
            <div>
              <h2>Reportes del Sistema</h2>
              <p>Informes de inventario, préstamos y usuarios.</p>
            </div>
            <button class="btn btn-secondary" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Imprimir Reporte
            </button>
          </div>

          <div class="report-container glass-card">
            <div class="report-header">
              <h2><i class="fa-solid fa-book-open-reader"></i> Reporte Consolidado de Biblioteca (PHP)</h2>
              <small id="reportDate">Fecha: <?= date('Y-m-d') ?></small>
            </div>

            <div class="report-summary-grid">
              <div class="report-box">
                <h4>Total Títulos</h4>
                <span id="repTotalTitulos">0</span>
              </div>
              <div class="report-box">
                <h4>Ejemplares Totales</h4>
                <span id="repTotalEjemplares">0</span>
              </div>
              <div class="report-box">
                <h4>Préstamos Activos</h4>
                <span id="repPrestamosActivos">0</span>
              </div>
              <div class="report-box">
                <h4>Correos Guardados</h4>
                <span id="repTotalLectores">0</span>
              </div>
            </div>

            <h3 class="mt-4">Detalle de Ejemplares por Categoría</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Títulos</th>
                  <th>Total Ejemplares</th>
                  <th>Disponibles</th>
                </tr>
              </thead>
              <tbody id="reportCategoryBody"></tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  </div>

  <!-- MODALES -->
  <div class="modal-overlay" id="bookModal">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3 id="bookModalTitle">Agregar Nuevo Libro</h3>
        <button class="btn-icon" onclick="closeModal('bookModal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form id="bookForm" onsubmit="handleBookSubmit(event)">
        <input type="hidden" id="bookId">
        <div class="form-grid">
          <div class="form-group span-2">
            <label>Título del Libro *</label>
            <input type="text" id="bookTitle" required>
          </div>
          <div class="form-group">
            <label>Autor *</label>
            <input type="text" id="bookAuthor" required>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select id="bookCategory">
              <option value="Novela">Novela</option>
              <option value="Clásico">Clásico</option>
              <option value="Fábula">Fábula</option>
              <option value="Ciencia Ficción">Ciencia Ficción</option>
            </select>
          </div>
          <div class="form-group">
            <label>ISBN</label>
            <input type="text" id="bookIsbn">
          </div>
          <div class="form-group">
            <label>Año</label>
            <input type="number" id="bookYear" value="2024">
          </div>
          <div class="form-group">
            <label>Ejemplares *</label>
            <input type="number" id="bookTotalCopies" value="3" min="1" required>
          </div>
          <div class="form-group">
            <label>Ubicación</label>
            <input type="text" id="bookLocation">
          </div>
          <div class="form-group span-2">
            <label>URL Imagen Portada</label>
            <input type="url" id="bookCover">
          </div>
          <div class="form-group span-2">
            <label>Descripción</label>
            <textarea id="bookDesc" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('bookModal')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Libro</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="loanModal">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>Registrar Nuevo Préstamo</h3>
        <button class="btn-icon" onclick="closeModal('loanModal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form id="loanForm" onsubmit="handleLoanSubmit(event)">
        <div class="form-group">
          <label>Seleccionar Libro *</label>
          <select id="loanBookSelect" required></select>
        </div>
        <div class="form-group">
          <label>Seleccionar Lector / Correo *</label>
          <select id="loanUserSelect" required></select>
        </div>
        <div class="form-group">
          <label>Días de Préstamo</label>
          <input type="number" id="loanDays" value="14" min="1" max="60">
        </div>
        <div class="form-group">
          <label>Notas</label>
          <input type="text" id="loanNotes">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('loanModal')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Préstamo</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="userModal">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>Registrar Nuevo Usuario / Correo</h3>
        <button class="btn-icon" onclick="closeModal('userModal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form id="userForm" onsubmit="handleUserSubmit(event)">
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre *</label>
            <input type="text" id="userNameInput" required>
          </div>
          <div class="form-group">
            <label>Apellido *</label>
            <input type="text" id="userLastNameInput" required>
          </div>
          <div class="form-group span-2">
            <label>Correo Electrónico (Login) *</label>
            <input type="email" id="userEmailInput" required placeholder="correo@ejemplo.com">
          </div>
          <div class="form-group">
            <label>Usuario *</label>
            <input type="text" id="userUsernameInput" required>
          </div>
          <div class="form-group">
            <label>Contraseña *</label>
            <input type="password" id="userPasswordInput" required value="123">
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" id="userPhoneInput">
          </div>
          <div class="form-group">
            <label>Rol</label>
            <select id="userRoleSelect">
              <option value="Lector">Lector</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Usuario</button>
        </div>
      </form>
    </div>
  </div>

  <script src="public/app.js"></script>
</body>
</html>
