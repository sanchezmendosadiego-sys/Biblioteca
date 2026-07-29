// App State
let state = {
  currentUser: JSON.parse(localStorage.getItem('bt_user')) || { nombre: 'Administrador', email: 'admin@biblioteca.com', usuario: 'admin', rol: 'Administrador' },
  books: [],
  loans: [],
  users: [],
  stats: {},
  currentTab: 'dashboard',
  viewMode: 'grid',
  activeDiagram: 'erd',
  zoomLevel: 1.0
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  updateUserUI();
  loadAllData();
  renderDiagram();

  // Search input listeners
  document.getElementById('globalSearchInput').addEventListener('input', (e) => {
    filterAndRenderCatalog(e.target.value);
  });

  document.getElementById('filterCategory').addEventListener('change', () => {
    filterAndRenderCatalog(document.getElementById('globalSearchInput').value);
  });

  document.getElementById('filterAvailability').addEventListener('change', () => {
    filterAndRenderCatalog(document.getElementById('globalSearchInput').value);
  });

  // View toggle
  document.getElementById('btnGridView').addEventListener('click', () => setViewMode('grid'));
  document.getElementById('btnTableView').addEventListener('click', () => setViewMode('table'));

  // Header quick buttons
  document.getElementById('btnQuickLoan').addEventListener('click', openLoanModal);
  document.getElementById('btnQuickAddBook').addEventListener('click', openBookModal);
  document.getElementById('btnLogout').addEventListener('click', logout);
});

// Fetch Data from Server
async function loadAllData() {
  try {
    const [booksRes, loansRes, usersRes, statsRes] = await Promise.all([
      fetch('/api/books'),
      fetch('/api/loans'),
      fetch('/api/users'),
      fetch('/api/stats')
    ]);

    state.books = await booksRes.json();
    state.loans = await loansRes.json();
    state.users = await usersRes.json();
    state.stats = await statsRes.json();

    renderDashboard();
    renderCatalog();
    renderLoans();
    renderUsers();
    renderReports();
  } catch (err) {
    console.error('Error al cargar datos del servidor:', err);
  }
}

// Navigation & Tabs
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.toggle('active', el.id === `tab-${tabId}`);
  });
  if (tabId === 'lucidchart') {
    renderDiagram();
  }
}

function setViewMode(mode) {
  state.viewMode = mode;
  document.getElementById('btnGridView').classList.toggle('active', mode === 'grid');
  document.getElementById('btnTableView').classList.toggle('active', mode === 'table');

  document.getElementById('catalogGrid').style.display = mode === 'grid' ? 'grid' : 'none';
  document.getElementById('catalogTableContainer').style.display = mode === 'table' ? 'block' : 'none';
}

// User & Auth
function updateUserUI() {
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const avatarEl = document.getElementById('userAvatar');

  if (state.currentUser) {
    nameEl.textContent = state.currentUser.email || state.currentUser.usuario || 'usuario@correo.com';
    roleEl.textContent = state.currentUser.rol || 'Lector';
    avatarEl.textContent = (state.currentUser.email || state.currentUser.nombre || 'U')[0].toUpperCase();
  }
}

function fillLogin(email, password) {
  document.getElementById('loginUser').value = email;
  document.getElementById('loginPass').value = password;
}

function logout() {
  localStorage.removeItem('bt_user');
  openModal('loginModal');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const userVal = document.getElementById('loginUser').value;
  const passVal = document.getElementById('loginPass').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: userVal, password: passVal })
    });
    const data = await res.json();
    if (data.success) {
      state.currentUser = data.user;
      localStorage.setItem('bt_user', JSON.stringify(data.user));
      updateUserUI();
      closeModal('loginModal');
    } else {
      alert(data.message || 'Correo o contraseña incorrectos');
    }
  } catch (err) {
    alert('Error al conectar con el servidor');
  }
}

// Renderers

// 1. Dashboard
function renderDashboard() {
  document.getElementById('statTotalTitulos').textContent = state.stats.totalTitulos || 0;
  document.getElementById('statTotalEjemplares').textContent = state.stats.totalLibros || 0;
  document.getElementById('statPrestamosActivos').textContent = state.stats.librosPrestados || 0;
  document.getElementById('statTotalLectores').textContent = state.stats.totalUsuarios || 0;

  const recentGrid = document.getElementById('recentBooksGrid');
  const recent = state.books.slice(-4).reverse();
  recentGrid.innerHTML = recent.map(b => `
    <div class="mini-book-card">
      <img src="${b.portada}" alt="${b.titulo}" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'">
      <h4>${b.titulo}</h4>
      <small>${b.autor}</small>
    </div>
  `).join('');

  const tableBody = document.getElementById('dashboardLoansTable');
  const activeLoans = state.loans.slice(-5).reverse();
  tableBody.innerHTML = activeLoans.map(l => `
    <tr>
      <td><strong>${l.bookTitulo}</strong></td>
      <td>${l.usuarioNombre}</td>
      <td>${l.fechaDevolucionEstimada}</td>
      <td><span class="badge ${l.estado === 'Activo' ? 'badge-info' : l.estado === 'Devuelto' ? 'badge-success' : 'badge-danger'}">${l.estado}</span></td>
    </tr>
  `).join('');
}

// 2. Catalog
function renderCatalog() {
  filterAndRenderCatalog(document.getElementById('globalSearchInput').value);
}

function filterAndRenderCatalog(query = '') {
  const categoryFilter = document.getElementById('filterCategory').value;
  const availFilter = document.getElementById('filterAvailability').value;
  const q = query.toLowerCase().trim();

  const filtered = state.books.filter(b => {
    const matchQuery = !q || b.titulo.toLowerCase().includes(q) || b.autor.toLowerCase().includes(q) || (b.isbn && b.isbn.includes(q));
    const matchCategory = categoryFilter === 'ALL' || b.categoria === categoryFilter;
    const matchAvail = availFilter === 'ALL' || 
      (availFilter === 'DISPONIBLE' && b.ejemplaresDisponibles > 0) ||
      (availFilter === 'AGOTADO' && b.ejemplaresDisponibles <= 0);
    return matchQuery && matchCategory && matchAvail;
  });

  const gridEl = document.getElementById('catalogGrid');
  gridEl.innerHTML = filtered.map(b => `
    <div class="book-card">
      <div class="book-cover-wrap">
        <img src="${b.portada}" alt="${b.titulo}" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'">
        <span class="book-category-tag">${b.categoria}</span>
      </div>
      <div class="book-details">
        <h3 class="book-title">${b.titulo}</h3>
        <p class="book-author">Por ${b.autor}</p>
        <div class="book-meta">
          <span><i class="fa-solid fa-bookmark"></i> ${b.ubicacion}</span>
          <span class="badge ${b.ejemplaresDisponibles > 0 ? 'badge-success' : 'badge-danger'}">
            ${b.ejemplaresDisponibles} / ${b.ejemplaresTotales} disp.
          </span>
        </div>
        <div class="book-card-actions">
          <button class="btn btn-secondary btn-block" onclick="openBookModal('${b.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
          <button class="btn btn-primary btn-block" ${b.ejemplaresDisponibles <= 0 ? 'disabled' : ''} onclick="quickLoanForBook('${b.id}')">Prestar</button>
        </div>
      </div>
    </div>
  `).join('');

  const tableBody = document.getElementById('catalogTableBody');
  tableBody.innerHTML = filtered.map(b => `
    <tr>
      <td><img src="${b.portada}" style="width:36px;height:48px;object-fit:cover;border-radius:4px;" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'"></td>
      <td><strong>${b.titulo}</strong></td>
      <td>${b.autor}</td>
      <td><span class="badge badge-info">${b.categoria}</span></td>
      <td><code>${b.isbn || 'N/A'}</code></td>
      <td><span class="badge ${b.ejemplaresDisponibles > 0 ? 'badge-success' : 'badge-danger'}">${b.ejemplaresDisponibles}/${b.ejemplaresTotales}</span></td>
      <td>${b.ubicacion}</td>
      <td>
        <button class="btn-icon" onclick="openBookModal('${b.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon" onclick="deleteBook('${b.id}')"><i class="fa-solid fa-trash text-rose"></i></button>
      </td>
    </tr>
  `).join('');
}

// 3. Loans
function renderLoans() {
  const tableBody = document.getElementById('loansTableBody');
  tableBody.innerHTML = state.loans.map(l => `
    <tr>
      <td><code>${l.id}</code></td>
      <td><strong>${l.bookTitulo}</strong></td>
      <td>${l.usuarioNombre}</td>
      <td>${l.fechaPrestamo}</td>
      <td>${l.fechaDevolucionEstimada}</td>
      <td><span class="badge ${l.estado === 'Activo' ? 'badge-info' : l.estado === 'Devuelto' ? 'badge-success' : 'badge-danger'}">${l.estado}</span></td>
      <td>
        ${l.estado !== 'Devuelto' ? `<button class="btn btn-secondary btn-sm" onclick="returnBookLoan('${l.id}')"><i class="fa-solid fa-rotate-left"></i> Devolver</button>` : '<span class="text-muted">Finalizado</span>'}
      </td>
    </tr>
  `).join('');
}

// 4. Users & Emails
function renderUsers() {
  const tableBody = document.getElementById('usersTableBody');
  tableBody.innerHTML = state.users.map(u => `
    <tr>
      <td><strong>${u.nombre} ${u.apellido}</strong></td>
      <td><span class="badge badge-info"><i class="fa-solid fa-envelope"></i> ${u.email}</span></td>
      <td><code>@${u.usuario || u.email.split('@')[0]}</code></td>
      <td>${u.telefono || 'N/A'}</td>
      <td><span class="badge ${u.rol === 'Administrador' ? 'badge-warning' : 'badge-info'}">${u.rol}</span></td>
      <td>${u.fechaRegistro || '2026-07-29'}</td>
    </tr>
  `).join('');
}

// Export DB JSON
function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    users: state.users,
    books: state.books,
    loans: state.loans
  }, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "biblioteca_datos_guardados.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// 5. Lucidchart Visual Diagrams
function switchDiagramView(type) {
  state.activeDiagram = type;
  document.getElementById('btnDiagUseCase').classList.toggle('active', type === 'usecase');
  document.getElementById('btnDiagERD').classList.toggle('active', type === 'erd');
  document.getElementById('btnDiagFlow').classList.toggle('active', type === 'flow');
  renderDiagram();
}

function zoomDiagram(factor) {
  state.zoomLevel *= factor;
  document.getElementById('lucidViewport').style.transform = `scale(${state.zoomLevel})`;
}

function resetDiagramZoom() {
  state.zoomLevel = 1.0;
  document.getElementById('lucidViewport').style.transform = `scale(1.0)`;
}

function renderDiagram() {
  const viewport = document.getElementById('lucidViewport');
  const titleEl = document.getElementById('diagramCurrentTitle');

  if (state.activeDiagram === 'usecase') {
    titleEl.textContent = 'Diagrama de Casos de Uso - Sistema Biblioteca Digital (Estilo Lucidchart)';
    viewport.innerHTML = `
      <svg width="850" height="420" viewBox="0 0 850 420" style="background:#181d28; border-radius:12px;">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff5a00"/>
          </marker>
        </defs>

        <rect x="220" y="30" width="560" height="360" rx="12" fill="#11151e" stroke="#00a3e0" stroke-width="2" stroke-dasharray="6,4"/>
        <text x="240" y="60" fill="#00a3e0" font-size="16" font-weight="bold">Sistema BiblioTech (Límite del Sistema)</text>

        <g transform="translate(60, 100)">
          <circle cx="20" cy="20" r="15" fill="#ff5a00"/>
          <line x1="20" y1="35" x2="20" y2="70" stroke="#ff5a00" stroke-width="3"/>
          <line x1="0" y1="48" x2="40" y2="48" stroke="#ff5a00" stroke-width="3"/>
          <line x1="20" y1="70" x2="5" y2="100" stroke="#ff5a00" stroke-width="3"/>
          <line x1="20" y1="70" x2="35" y2="100" stroke="#ff5a00" stroke-width="3"/>
          <text x="-10" y="125" fill="#ffffff" font-size="13" font-weight="bold">Lector / Usuario</text>
        </g>

        <g transform="translate(60, 270)">
          <circle cx="20" cy="20" r="15" fill="#8b5cf6"/>
          <line x1="20" y1="35" x2="20" y2="70" stroke="#8b5cf6" stroke-width="3"/>
          <line x1="0" y1="48" x2="40" y2="48" stroke="#8b5cf6" stroke-width="3"/>
          <line x1="20" y1="70" x2="5" y2="100" stroke="#8b5cf6" stroke-width="3"/>
          <line x1="20" y1="70" x2="35" y2="100" stroke="#8b5cf6" stroke-width="3"/>
          <text x="-15" y="125" fill="#ffffff" font-size="13" font-weight="bold">Administrador</text>
        </g>

        <g transform="translate(280, 90)">
          <ellipse cx="90" cy="30" rx="80" ry="25" fill="#00a3e0" fill-opacity="0.2" stroke="#00a3e0" stroke-width="2"/>
          <text x="35" y="35" fill="#ffffff" font-size="13" font-weight="bold">Login con Correo</text>
        </g>

        <g transform="translate(540, 90)">
          <ellipse cx="90" cy="30" rx="80" ry="25" fill="#ff5a00" fill-opacity="0.2" stroke="#ff5a00" stroke-width="2"/>
          <text x="30" y="35" fill="#ffffff" font-size="13" font-weight="bold">Consultar Catálogo</text>
        </g>

        <g transform="translate(280, 210)">
          <ellipse cx="90" cy="30" rx="80" ry="25" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
          <text x="30" y="35" fill="#ffffff" font-size="13" font-weight="bold">Solicitar Préstamo</text>
        </g>

        <g transform="translate(540, 210)">
          <ellipse cx="90" cy="30" rx="80" ry="25" fill="#8b5cf6" fill-opacity="0.2" stroke="#8b5cf6" stroke-width="2"/>
          <text x="35" y="35" fill="#ffffff" font-size="13" font-weight="bold">Devolver Libro</text>
        </g>

        <g transform="translate(410, 310)">
          <ellipse cx="90" cy="30" rx="80" ry="25" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="2"/>
          <text x="30" y="35" fill="#ffffff" font-size="13" font-weight="bold">Gestionar Libros/BD</text>
        </g>

        <line x1="120" y1="140" x2="280" y2="120" stroke="#ff5a00" stroke-width="2"/>
        <line x1="120" y1="140" x2="540" y2="120" stroke="#ff5a00" stroke-width="2"/>
        <line x1="120" y1="140" x2="280" y2="240" stroke="#ff5a00" stroke-width="2"/>
        <line x1="120" y1="310" x2="410" y2="340" stroke="#8b5cf6" stroke-width="2"/>
        <line x1="120" y1="310" x2="540" y2="240" stroke="#8b5cf6" stroke-width="2"/>
      </svg>
    `;
  } else if (state.activeDiagram === 'erd') {
    titleEl.textContent = 'Diagrama Entidad-Relación (ERD) - 7 Campos Usuarios | 6 Campos Préstamos | 8 Campos Libros';
    viewport.innerHTML = `
      <svg width="880" height="430" viewBox="0 0 880 430" style="background:#181d28; border-radius:12px;">
        <!-- Entity 1: USUARIOS (7 CAMPOS EXACTOS) -->
        <rect x="30" y="40" width="240" height="310" rx="8" fill="#11151e" stroke="#ff5a00" stroke-width="2"/>
        <rect x="30" y="40" width="240" height="40" rx="8" fill="#ff5a00"/>
        <text x="95" y="65" fill="#ffffff" font-size="15" font-weight="bold">USUARIOS (7)</text>
        <text x="45" y="110" fill="#ffffff" font-size="12">1. 🔑 id (PK)</text>
        <text x="45" y="145" fill="#00a3e0" font-size="12">2. ✉️ email (LOGIN)</text>
        <text x="45" y="180" fill="#ffffff" font-size="12">3. 👤 nombre</text>
        <text x="45" y="215" fill="#ffffff" font-size="12">4. 👤 apellido</text>
        <text x="45" y="250" fill="#ffffff" font-size="12">5. 🔒 password</text>
        <text x="45" y="285" fill="#ffffff" font-size="12">6. 🛡️ rol (Admin/Lector)</text>
        <text x="45" y="320" fill="#ffffff" font-size="12">7. 📞 telefono</text>

        <!-- Entity 2: PRESTAMOS (6 CAMPOS EXACTOS) -->
        <rect x="320" y="40" width="240" height="280" rx="8" fill="#11151e" stroke="#00a3e0" stroke-width="2"/>
        <rect x="320" y="40" width="240" height="40" rx="8" fill="#00a3e0"/>
        <text x="375" y="65" fill="#ffffff" font-size="15" font-weight="bold">PRESTAMOS (6)</text>
        <text x="335" y="110" fill="#ffffff" font-size="12">1. 🔑 id (PK)</text>
        <text x="335" y="145" fill="#ff5a00" font-size="12">2. 🔗 userId (FK usuarios)</text>
        <text x="335" y="180" fill="#10b981" font-size="12">3. 🔗 bookId (FK libros)</text>
        <text x="335" y="215" fill="#ffffff" font-size="12">4. 📅 fechaPrestamo</text>
        <text x="335" y="250" fill="#ffffff" font-size="12">5. ⏱️ fechaDevolucion</text>
        <text x="335" y="285" fill="#ffffff" font-size="12">6. 🏷️ estado (Activo/Devuelto)</text>

        <!-- Entity 3: LIBROS (8 CAMPOS EXACTOS) -->
        <rect x="610" y="40" width="240" height="340" rx="8" fill="#11151e" stroke="#10b981" stroke-width="2"/>
        <rect x="610" y="40" width="240" height="40" rx="8" fill="#10b981"/>
        <text x="680" y="65" fill="#ffffff" font-size="15" font-weight="bold">LIBROS (8)</text>
        <text x="625" y="110" fill="#ffffff" font-size="12">1. 🔑 id (PK)</text>
        <text x="625" y="140" fill="#ffffff" font-size="12">2. 📚 titulo</text>
        <text x="625" y="170" fill="#ffffff" font-size="12">3. ✍️ autor</text>
        <text x="625" y="200" fill="#ffffff" font-size="12">4. 🏷️ categoria</text>
        <text x="625" y="230" fill="#ffffff" font-size="12">5. 🔢 isbn</text>
        <text x="625" y="260" fill="#ffffff" font-size="12">6. 📦 ejemplaresTotales</text>
        <text x="625" y="290" fill="#ffffff" font-size="12">7. ✅ ejemplaresDisponibles</text>
        <text x="625" y="320" fill="#ffffff" font-size="12">8. 📍 ubicacion</text>

        <!-- Relationships -->
        <line x1="270" y1="140" x2="320" y2="140" stroke="#ff5a00" stroke-width="3"/>
        <text x="282" y="130" fill="#ff5a00" font-size="12" font-weight="bold">1:N</text>

        <line x1="560" y1="180" x2="610" y2="180" stroke="#10b981" stroke-width="3"/>
        <text x="572" y="170" fill="#10b981" font-size="12" font-weight="bold">N:1</text>
      </svg>
    `;
  } else {
    titleEl.textContent = 'Diagrama de Flujo del Sistema de Biblioteca';
    viewport.innerHTML = `
      <svg width="850" height="420" viewBox="0 0 850 420" style="background:#181d28; border-radius:12px;">
        <rect x="40" y="180" width="130" height="60" rx="30" fill="#ff5a00"/>
        <text x="65" y="215" fill="#ffffff" font-size="14" font-weight="bold">1. Login Correo</text>

        <path d="M 170 210 L 230 210" stroke="#ffffff" stroke-width="2" marker-end="url(#arrow)"/>

        <rect x="230" y="180" width="150" height="60" rx="8" fill="#00a3e0"/>
        <text x="245" y="215" fill="#ffffff" font-size="14" font-weight="bold">2. Buscar Libro</text>

        <path d="M 380 210 L 440 210" stroke="#ffffff" stroke-width="2"/>

        <polygon points="500,160 560,210 500,260 440,210" fill="#f59e0b"/>
        <text x="470" y="215" fill="#ffffff" font-size="13" font-weight="bold">¿Disponible?</text>

        <path d="M 560 210 L 620 210" stroke="#10b981" stroke-width="2"/>
        <text x="575" y="200" fill="#10b981" font-size="12" font-weight="bold">SÍ</text>

        <rect x="620" y="180" width="170" height="60" rx="8" fill="#10b981"/>
        <text x="635" y="215" fill="#ffffff" font-size="14" font-weight="bold">3. Guardar Préstamo</text>

        <path d="M 500 260 L 500 320" stroke="#f43f5e" stroke-width="2"/>
        <text x="510" y="290" fill="#f43f5e" font-size="12" font-weight="bold">NO</text>

        <rect x="425" y="320" width="150" height="50" rx="8" fill="#f43f5e"/>
        <text x="445" y="350" fill="#ffffff" font-size="13" font-weight="bold">Notificar Agotado</text>
      </svg>
    `;
  }
}

// 6. Reports
function renderReports() {
  document.getElementById('reportDate').textContent = `Fecha de reporte: ${new Date().toLocaleDateString('es-ES')}`;
  document.getElementById('repTotalTitulos').textContent = state.stats.totalTitulos || 0;
  document.getElementById('repTotalEjemplares').textContent = state.stats.totalLibros || 0;
  document.getElementById('repPrestamosActivos').textContent = state.stats.librosPrestados || 0;
  document.getElementById('repTotalLectores').textContent = state.stats.totalUsuarios || 0;

  const categories = {};
  state.books.forEach(b => {
    const cat = b.categoria || 'General';
    if (!categories[cat]) {
      categories[cat] = { titulos: 0, ejemplares: 0, disponibles: 0 };
    }
    categories[cat].titulos += 1;
    categories[cat].ejemplares += b.ejemplaresTotales;
    categories[cat].disponibles += b.ejemplaresDisponibles;
  });

  const bodyEl = document.getElementById('reportCategoryBody');
  bodyEl.innerHTML = Object.entries(categories).map(([cat, data]) => `
    <tr>
      <td><strong>${cat}</strong></td>
      <td>${data.titulos}</td>
      <td>${data.ejemplares}</td>
      <td>${data.disponibles}</td>
    </tr>
  `).join('');
}

// Book Modal Actions
function openBookModal(bookId = null) {
  const form = document.getElementById('bookForm');
  form.reset();
  
  if (bookId) {
    const book = state.books.find(b => b.id === bookId);
    if (book) {
      document.getElementById('bookModalTitle').textContent = 'Editar Libro';
      document.getElementById('bookId').value = book.id;
      document.getElementById('bookTitle').value = book.titulo;
      document.getElementById('bookAuthor').value = book.autor;
      document.getElementById('bookCategory').value = book.categoria;
      document.getElementById('bookIsbn').value = book.isbn;
      document.getElementById('bookYear').value = book.anio;
      document.getElementById('bookTotalCopies').value = book.ejemplaresTotales;
      document.getElementById('bookLocation').value = book.ubicacion;
      document.getElementById('bookCover').value = book.portada;
      document.getElementById('bookDesc').value = book.descripcion;
    }
  } else {
    document.getElementById('bookModalTitle').textContent = 'Agregar Nuevo Libro';
    document.getElementById('bookId').value = '';
  }

  openModal('bookModal');
}

async function handleBookSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('bookId').value;
  const payload = {
    titulo: document.getElementById('bookTitle').value,
    autor: document.getElementById('bookAuthor').value,
    categoria: document.getElementById('bookCategory').value,
    isbn: document.getElementById('bookIsbn').value,
    anio: document.getElementById('bookYear').value,
    ejemplaresTotales: document.getElementById('bookTotalCopies').value,
    ubicacion: document.getElementById('bookLocation').value,
    portada: document.getElementById('bookCover').value,
    descripcion: document.getElementById('bookDesc').value
  };

  const url = id ? `/api/books/${id}` : '/api/books';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('bookModal');
      await loadAllData();
    }
  } catch (err) {
    alert('Error al guardar libro');
  }
}

async function deleteBook(bookId) {
  if (!confirm('¿Estás seguro de eliminar este libro del catálogo?')) return;
  try {
    const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
    if (res.ok) await loadAllData();
  } catch (err) {
    alert('Error al eliminar libro');
  }
}

// Loan Modal Actions
function openLoanModal() {
  const bookSelect = document.getElementById('loanBookSelect');
  const userSelect = document.getElementById('loanUserSelect');

  bookSelect.innerHTML = state.books.map(b => `
    <option value="${b.id}" ${b.ejemplaresDisponibles <= 0 ? 'disabled' : ''}>
      ${b.titulo} (${b.ejemplaresDisponibles} disp.)
    </option>
  `).join('');

  userSelect.innerHTML = state.users.map(u => `
    <option value="${u.id}">${u.nombre} ${u.apellido} (${u.email})</option>
  `).join('');

  openModal('loanModal');
}

function quickLoanForBook(bookId) {
  openLoanModal();
  document.getElementById('loanBookSelect').value = bookId;
}

async function handleLoanSubmit(e) {
  e.preventDefault();
  const payload = {
    bookId: document.getElementById('loanBookSelect').value,
    userId: document.getElementById('loanUserSelect').value,
    diasPrestamo: document.getElementById('loanDays').value,
    notas: document.getElementById('loanNotes').value
  };

  try {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('loanModal');
      await loadAllData();
    } else {
      alert(data.message || 'Error al registrar préstamo');
    }
  } catch (err) {
    alert('Error de conexión');
  }
}

async function returnBookLoan(loanId) {
  try {
    const res = await fetch(`/api/loans/${loanId}/return`, { method: 'PUT' });
    if (res.ok) await loadAllData();
  } catch (err) {
    alert('Error al registrar devolución');
  }
}

// User Modal Actions
function openUserModal() {
  document.getElementById('userForm').reset();
  openModal('userModal');
}

async function handleUserSubmit(e) {
  e.preventDefault();
  const payload = {
    nombre: document.getElementById('userNameInput').value,
    apellido: document.getElementById('userLastNameInput').value,
    email: document.getElementById('userEmailInput').value,
    usuario: document.getElementById('userUsernameInput').value,
    password: document.getElementById('userPasswordInput').value,
    telefono: document.getElementById('userPhoneInput').value,
    rol: document.getElementById('userRoleSelect').value
  };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('userModal');
      await loadAllData();
    } else {
      alert(data.message || 'Error al registrar usuario');
    }
  } catch (err) {
    alert('Error de conexión');
  }
}

// Modal Helpers
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
