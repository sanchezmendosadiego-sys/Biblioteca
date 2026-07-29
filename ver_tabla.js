const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const args = process.argv.slice(2);
const tableName = (args[0] || 'libros').toLowerCase();

function readData() {
  if (!fs.existsSync(DATA_FILE)) return null;
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

const db = readData();

console.log("==========================================================================");
console.log(` 📊 CONSULTA DE ESTRUCTURA Y TABLA MARIADB / DATABASE: '${tableName.toUpperCase()}'`);
console.log("==========================================================================");

if (tableName === 'libros' || tableName === 'libro') {
  console.log("\n📐 ESTRUCTURA DE LA TABLA (MARIADB DESCRIBE `libros`):");
  console.table([
    { Campo: 'id', Tipo: 'INT AUTO_INCREMENT', Clave: 'PRIMARY KEY', Nulo: 'NO' },
    { Campo: 'titulo', Tipo: 'VARCHAR(200)', Clave: '', Nulo: 'NO' },
    { Campo: 'autor', Tipo: 'VARCHAR(150)', Clave: '', Nulo: 'NO' },
    { Campo: 'isbn', Tipo: 'VARCHAR(50)', Clave: '', Nulo: 'YES' },
    { Campo: 'categoria_id', Tipo: 'INT', Clave: 'FOREIGN KEY', Nulo: 'YES' },
    { Campo: 'anio', Tipo: 'INT', Clave: '', Nulo: 'YES' },
    { Campo: 'ejemplares_totales', Tipo: 'INT', Clave: '', Nulo: 'NO' },
    { Campo: 'ejemplares_disponibles', Tipo: 'INT', Clave: '', Nulo: 'NO' },
    { Campo: 'ubicacion', Tipo: 'VARCHAR(100)', Clave: '', Nulo: 'YES' },
    { Campo: 'descripcion', Tipo: 'TEXT', Clave: '', Nulo: 'YES' }
  ]);

  if (db && db.books) {
    console.log("\n📚 REGISTROS ACTUALES GUARDADOS (SELECT * FROM `libros`):");
    console.table(db.books.map(b => ({
      ID: b.id,
      Título: b.titulo,
      Autor: b.autor,
      Categoría: b.categoria,
      Disponibles: `${b.ejemplaresDisponibles}/${b.ejemplaresTotales}`,
      Ubicación: b.ubicacion
    })));
  }

} else if (tableName === 'usuarios' || tableName === 'usuario') {
  console.log("\n📐 ESTRUCTURA DE LA TABLA (MARIADB DESCRIBE `usuarios`):");
  console.table([
    { Campo: 'id', Tipo: 'INT AUTO_INCREMENT', Clave: 'PRIMARY KEY', Nulo: 'NO' },
    { Campo: 'nombre', Tipo: 'VARCHAR(100)', Clave: '', Nulo: 'NO' },
    { Campo: 'apellido', Tipo: 'VARCHAR(100)', Clave: '', Nulo: 'NO' },
    { Campo: 'email', Tipo: 'VARCHAR(150)', Clave: 'UNIQUE (LOGIN)', Nulo: 'NO' },
    { Campo: 'usuario', Tipo: 'VARCHAR(50)', Clave: 'UNIQUE', Nulo: 'NO' },
    { Campo: 'password', Tipo: 'VARCHAR(255)', Clave: '', Nulo: 'NO' },
    { Campo: 'rol', Tipo: "ENUM('Admin', 'Lector')", Clave: '', Nulo: 'NO' },
    { Campo: 'fecha_registro', Tipo: 'DATE', Clave: '', Nulo: 'NO' }
  ]);

  if (db && db.users) {
    console.log("\n👥 REGISTROS ACTUALES GUARDADOS (SELECT * FROM `usuarios`):");
    console.table(db.users.map(u => ({
      ID: u.id,
      Nombre: `${u.nombre} ${u.apellido}`,
      Correo_Email: u.email,
      Usuario: u.usuario,
      Rol: u.rol,
      Fecha: u.fechaRegistro
    })));
  }

} else if (tableName === 'prestamos' || tableName === 'prestamo') {
  console.log("\n📐 ESTRUCTURA DE LA TABLA (MARIADB DESCRIBE `prestamos`):");
  console.table([
    { Campo: 'id', Tipo: 'INT AUTO_INCREMENT', Clave: 'PRIMARY KEY', Nulo: 'NO' },
    { Campo: 'libro_id', Tipo: 'INT', Clave: 'FK -> libros.id', Nulo: 'NO' },
    { Campo: 'usuario_id', Tipo: 'INT', Clave: 'FK -> usuarios.id', Nulo: 'NO' },
    { Campo: 'fecha_prestamo', Tipo: 'DATE', Clave: '', Nulo: 'NO' },
    { Campo: 'fecha_devolucion_estimada', Tipo: 'DATE', Clave: '', Nulo: 'NO' },
    { Campo: 'fecha_devolucion_real', Tipo: 'DATE', Clave: '', Nulo: 'YES' },
    { Campo: 'estado', Tipo: "ENUM('Activo', 'Devuelto', 'Vencido')", Clave: '', Nulo: 'NO' },
    { Campo: 'notas', Tipo: 'TEXT', Clave: '', Nulo: 'YES' }
  ]);

  if (db && db.loans) {
    console.log("\n📑 REGISTROS ACTUALES GUARDADOS (SELECT * FROM `prestamos`):");
    console.table(db.loans.map(l => ({
      ID: l.id,
      Libro: l.bookTitulo,
      Lector_Correo: l.usuarioNombre,
      Préstamo: l.fechaPrestamo,
      Límite: l.fechaDevolucionEstimada,
      Estado: l.estado
    })));
  }

} else {
  console.log("Tablas disponibles: libros, usuarios, prestamos");
  console.log("Ejemplo: node ver_tabla.js libros");
}

console.log("==========================================================================");
