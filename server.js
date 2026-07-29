const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Datos iniciales de demostración
const defaultData = {
  users: [
    {
      id: "u1",
      nombre: "Administrador",
      apellido: "Principal",
      email: "admin@biblioteca.com",
      usuario: "admin",
      password: "123",
      rol: "Administrador",
      telefono: "555-0100",
      fechaRegistro: "2026-01-15"
    },
    {
      id: "u2",
      nombre: "María",
      apellido: "González",
      email: "maria.g@gmail.com",
      usuario: "maria.g",
      password: "123",
      rol: "Lector",
      telefono: "555-0199",
      fechaRegistro: "2026-02-10"
    },
    {
      id: "u3",
      nombre: "Carlos",
      apellido: "López",
      email: "carlos.l@gmail.com",
      usuario: "carlos.l",
      password: "123",
      rol: "Lector",
      telefono: "555-0244",
      fechaRegistro: "2026-03-01"
    }
  ],
  books: [
    {
      id: "b1",
      titulo: "Cien Años de Soledad",
      autor: "Gabriel García Márquez",
      isbn: "978-0307474728",
      categoria: "Novela",
      anio: 1967,
      ejemplaresTotales: 5,
      ejemplaresDisponibles: 3,
      ubicacion: "Estante A-12",
      portada: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
      descripcion: "Obra maestra del realismo mágico sobre la familia Buendía en el pueblo ficticio de Macondo."
    },
    {
      id: "b2",
      titulo: "Don Quijote de la Mancha",
      autor: "Miguel de Cervantes",
      isbn: "978-8424116286",
      categoria: "Clásico",
      anio: 1605,
      ejemplaresTotales: 3,
      ejemplaresDisponibles: 2,
      ubicacion: "Estante B-04",
      portada: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
      descripcion: "Las aventuras del hidalgo Don Quijote y su fiel escudero Sancho Panza."
    },
    {
      id: "b3",
      titulo: "El Principito",
      autor: "Antoine de Saint-Exupéry",
      isbn: "978-0156012195",
      categoria: "Fábula",
      anio: 1943,
      ejemplaresTotales: 8,
      ejemplaresDisponibles: 7,
      ubicacion: "Estante C-01",
      portada: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
      descripcion: "Cuento poético que viene acompañado de ilustraciones hechas con acuarelas."
    },
    {
      id: "b4",
      titulo: "1984",
      autor: "George Orwell",
      isbn: "978-0451524935",
      categoria: "Ciencia Ficción",
      anio: 1949,
      ejemplaresTotales: 4,
      ejemplaresDisponibles: 4,
      ubicacion: "Estante A-08",
      portada: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80",
      descripcion: "Novela distópica sobre la vigilancia masiva y el control gubernamental."
    }
  ],
  loans: [
    {
      id: "p1",
      bookId: "b1",
      userId: "u2",
      bookTitulo: "Cien Años de Soledad",
      usuarioNombre: "María González",
      fechaPrestamo: "2026-07-15",
      fechaDevolucionEstimada: "2026-07-29",
      fechaDevolucionReal: null,
      estado: "Activo",
      notas: "Primer préstamo del mes"
    },
    {
      id: "p2",
      bookId: "b2",
      userId: "u3",
      bookTitulo: "Don Quijote de la Mancha",
      usuarioNombre: "Carlos López",
      fechaPrestamo: "2026-07-10",
      fechaDevolucionEstimada: "2026-07-24",
      fechaDevolucionReal: null,
      estado: "Vencido",
      notas: "Notificación enviada"
    }
  ]
};

// Funciones para leer/guardar datos
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return defaultData;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// MIME Types para archivos estáticos
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Helper para leer body JSON
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Servidor nativo de Node.js (Sin dependencias externas)
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- RUTAS DE LA API ---
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // Auth Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { usuario, password } = await getRequestBody(req);
      const db = readData();
      const found = db.users.find(u => (u.usuario === usuario || u.email === usuario) && u.password === password);
      if (found) {
        const { password: _, ...userWithoutPass } = found;
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, user: userWithoutPass }));
      }
      res.writeHead(401);
      return res.end(JSON.stringify({ success: false, message: 'Usuario o correo incorrectos' }));
    }

    // Auth Register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const { nombre, apellido, email, usuario, password, telefono, rol } = await getRequestBody(req);
      const db = readData();
      if (db.users.some(u => u.usuario === usuario || u.email === email)) {
        res.writeHead(400);
        return res.end(JSON.stringify({ success: false, message: 'El usuario o correo ya existe' }));
      }
      const newUser = {
        id: 'u_' + Date.now(),
        nombre, apellido, email, usuario, password,
        telefono: telefono || '',
        rol: rol || 'Lector',
        fechaRegistro: new Date().toISOString().split('T')[0]
      };
      db.users.push(newUser);
      saveData(db);
      const { password: _, ...userWithoutPass } = newUser;
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, user: userWithoutPass }));
    }

    // Libros GET / POST
    if (pathname === '/api/books') {
      const db = readData();
      if (method === 'GET') {
        res.writeHead(200);
        return res.end(JSON.stringify(db.books));
      }
      if (method === 'POST') {
        const body = await getRequestBody(req);
        const newBook = {
          id: 'b_' + Date.now(),
          titulo: body.titulo,
          autor: body.autor,
          isbn: body.isbn || 'N/A',
          categoria: body.categoria || 'General',
          anio: parseInt(body.anio) || new Date().getFullYear(),
          ejemplaresTotales: parseInt(body.ejemplaresTotales) || 1,
          ejemplaresDisponibles: parseInt(body.ejemplaresTotales) || 1,
          ubicacion: body.ubicacion || 'Estante General',
          portada: body.portada || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
          descripcion: body.descripcion || ''
        };
        db.books.push(newBook);
        saveData(db);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, book: newBook }));
      }
    }

    // Libros PUT / DELETE
    if (pathname.startsWith('/api/books/')) {
      const bookId = pathname.replace('/api/books/', '');
      const db = readData();
      const index = db.books.findIndex(b => b.id === bookId);

      if (index === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: 'Libro no encontrado' }));
      }

      if (method === 'PUT') {
        const body = await getRequestBody(req);
        db.books[index] = { ...db.books[index], ...body };
        saveData(db);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, book: db.books[index] }));
      }

      if (method === 'DELETE') {
        db.books.splice(index, 1);
        saveData(db);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // Usuarios GET
    if (pathname === '/api/users' && method === 'GET') {
      const db = readData();
      const safeUsers = db.users.map(({ password, ...u }) => u);
      res.writeHead(200);
      return res.end(JSON.stringify(safeUsers));
    }

    // Préstamos GET / POST
    if (pathname === '/api/loans') {
      const db = readData();
      if (method === 'GET') {
        res.writeHead(200);
        return res.end(JSON.stringify(db.loans));
      }
      if (method === 'POST') {
        const { bookId, userId, diasPrestamo, notas } = await getRequestBody(req);
        const book = db.books.find(b => b.id === bookId);
        const user = db.users.find(u => u.id === userId);

        if (!book || !user) {
          res.writeHead(404);
          return res.end(JSON.stringify({ message: 'Libro o usuario no encontrado' }));
        }
        if (book.ejemplaresDisponibles <= 0) {
          res.writeHead(400);
          return res.end(JSON.stringify({ message: 'No hay ejemplares disponibles' }));
        }

        const hoy = new Date();
        const devFecha = new Date();
        devFecha.setDate(hoy.getDate() + (parseInt(diasPrestamo) || 14));

        const newLoan = {
          id: 'p_' + Date.now(),
          bookId,
          userId,
          bookTitulo: book.titulo,
          usuarioNombre: `${user.nombre} ${user.apellido} (${user.email})`,
          fechaPrestamo: hoy.toISOString().split('T')[0],
          fechaDevolucionEstimada: devFecha.toISOString().split('T')[0],
          fechaDevolucionReal: null,
          estado: 'Activo',
          notas: notas || ''
        };

        book.ejemplaresDisponibles -= 1;
        db.loans.push(newLoan);
        saveData(db);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, loan: newLoan }));
      }
    }

    // Devolución de Préstamo
    if (pathname.includes('/return') && method === 'PUT') {
      const loanId = pathname.replace('/api/loans/', '').replace('/return', '');
      const db = readData();
      const loan = db.loans.find(l => l.id === loanId);
      if (!loan) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: 'Préstamo no encontrado' }));
      }

      loan.estado = 'Devuelto';
      loan.fechaDevolucionReal = new Date().toISOString().split('T')[0];

      const book = db.books.find(b => b.id === loan.bookId);
      if (book) book.ejemplaresDisponibles += 1;

      saveData(db);
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, loan }));
    }

    // Stats
    if (pathname === '/api/stats' && method === 'GET') {
      const db = readData();
      const totalLibros = db.books.reduce((acc, b) => acc + (b.ejemplaresTotales || 0), 0);
      const librosPrestados = db.loans.filter(l => l.estado === 'Activo' || l.estado === 'Vencido').length;

      res.writeHead(200);
      return res.end(JSON.stringify({
        totalTitulos: db.books.length,
        totalLibros,
        librosPrestados,
        librosDisponibles: totalLibros - librosPrestados,
        totalUsuarios: db.users.length,
        prestamosVencidos: db.loans.filter(l => l.estado === 'Vencido').length,
        prestamosHistoricos: db.loans.length
      }));
    }
  }

  // Archivos Estáticos
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, fallbackContent) => {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fallbackContent);
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(` Servidor de Biblioteca Digital listo y corriendo`);
    console.log(` Accede desde tu navegador en: http://localhost:${port}`);
    console.log(`====================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${port} ocupado, probando puerto ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(DEFAULT_PORT);
