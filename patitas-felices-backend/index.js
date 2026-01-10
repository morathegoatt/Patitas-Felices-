const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const db = require('./db');

// Configuración inicial
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-super-secreto'; // TODO: Mover a variables de entorno en producción

// Middleware
app.use(cors());
app.use(express.json());

/* =========================================================
 * RUTAS DE LA API
 * ========================================================= */

// Health Check
app.get('/', (req, res) => {
  res.send('API de Patitas Felices funcionando correctamente.');
});

// --- AUTENTICACIÓN Y REGISTRO ---

// Registro de nuevos clientes
app.post('/api/clientes/registro', async (req, res) => {
  const { nombre, direccion, telefono, email, password } = req.body;

  try {
    // Encriptación de contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO Dueño (nombre, direccion, telefono, email, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_dueño, nombre, email
    `;
    
    const result = await db.query(sql, [nombre, direccion, telefono, email, password_hash]);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El email o teléfono ya está registrado.' });
    }
    res.status(500).json({ error: 'Error interno al registrar cliente.' });
  }
});

// Login de Clientes
app.post('/api/auth/login-cliente', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM Dueño WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const dueño = result.rows[0];
    const esValida = await bcrypt.compare(password, dueño.password_hash);

    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generación de Token JWT
    const token = jwt.sign({ id: dueño.id_dueño, role: 'cliente' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, nombre: dueño.nombre });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servicio de autenticación.' });
  }
});

// Login de Empleados (Veterinarios/Admin)
app.post('/api/auth/login-empleado', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM Empleado WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const empleado = result.rows[0];
    const esValida = await bcrypt.compare(password, empleado.password_hash);

    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ id: empleado.id_empleado, role: 'empleado' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, nombre: empleado.nombre });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servicio de autenticación.' });
  }
});

// --- GESTIÓN ADMINISTRATIVA (DASHBOARD) ---

// Listar todos los clientes
app.get('/api/admin/clientes', async (req, res) => {
  try {
    const result = await db.query('SELECT id_dueño, nombre, email, telefono, direccion FROM Dueño ORDER BY id_dueño ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al recuperar listado de clientes.' });
  }
});

// Eliminar cliente (Eliminación en cascada manual mediante CTEs)
app.delete('/api/admin/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      WITH mascotas_del_dueño AS (
        SELECT id_mascota FROM Mascota WHERE id_dueño = $1
      ),
      citas_borradas AS (
        DELETE FROM Cita WHERE id_mascota IN (SELECT id_mascota FROM mascotas_del_dueño)
      ),
      historial_borrado AS (
        DELETE FROM Historial_Clinico WHERE id_mascota IN (SELECT id_mascota FROM mascotas_del_dueño)
      ),
      mascotas_borradas AS (
        DELETE FROM Mascota WHERE id_dueño = $1
      )
      DELETE FROM Dueño WHERE id_dueño = $1 RETURNING *;
    `;
    
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error crítico al eliminar cliente y sus registros asociados.' });
  }
});

// Actualizar cliente
app.put('/api/admin/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono } = req.body;

  try {
    const sql = `
      UPDATE Dueño SET nombre = $1, email = $2, telefono = $3
      WHERE id_dueño = $4 RETURNING *
    `;
    const result = await db.query(sql, [nombre, email, telefono, id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'El email o teléfono ya está en uso.' });
    res.status(500).json({ error: 'Error al actualizar datos.' });
  }
});

// Listar Citas pendientes (Join con Mascotas y Dueños)
app.get('/api/admin/citas', async (req, res) => {
  try {
    const sql = `
      SELECT c.id_cita, c.fecha, c.hora, c.motivo, m.nombre AS nombre_mascota, d.nombre AS nombre_dueño
      FROM Cita c
      JOIN Mascota m ON c.id_mascota = m.id_mascota
      JOIN Dueño d ON m.id_dueño = d.id_dueño
      LEFT JOIN Consulta co ON c.id_cita = co.id_cita
      WHERE co.id_consulta IS NULL
      ORDER BY c.fecha, c.hora;
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener agenda.' });
  }
});

// --- OPERACIONES DE NEGOCIO (Mascotas y Citas) ---

app.post('/api/mascotas/registro', async (req, res) => {
  const { nombre, especie, raza, fecha_nacimiento, sexo, id_dueño } = req.body;
  try {
    const sql = `INSERT INTO Mascota (nombre, especie, raza, fecha_nacimiento, sexo, id_dueño)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const result = await db.query(sql, [nombre, especie, raza, fecha_nacimiento, sexo, id_dueño]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar mascota.' });
  }
});

app.post('/api/citas/agendar', async (req, res) => {
  const { fecha, hora, motivo, id_mascota } = req.body;
  try {
    const sql = `INSERT INTO Cita (fecha, hora, motivo, id_mascota) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await db.query(sql, [fecha, hora, motivo, id_mascota]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agendar cita.' });
  }
});

// --- TRANSACCIONES COMPLEJAS (Atención Médica) ---

// Registro de Consulta Completa (Transacción SQL)
app.post('/api/admin/consulta-completa', async (req, res) => {
  const { id_cita, id_veterinario, diagnostico, notas, medicamentos } = req.body;
  const client = await db.pool.connect(); 

  try {
    await client.query('BEGIN'); // Inicio de transacción

    // 1. Crear Consulta
    const consultaSql = `INSERT INTO Consulta (id_cita, diagnostico, notas, id_veterinario)
                         VALUES ($1, $2, $3, $4) RETURNING id_consulta`;
    const consultaResult = await client.query(consultaSql, [id_cita, diagnostico, notas, id_veterinario]);
    const nuevoIdConsulta = consultaResult.rows[0].id_consulta;

    // 2. Crear Tratamiento
    const tratamientoResult = await client.query('INSERT INTO Tratamiento (id_consulta) VALUES ($1) RETURNING id_tratamiento', [nuevoIdConsulta]);
    const nuevoIdTratamiento = tratamientoResult.rows[0].id_tratamiento;

    // 3. Registrar Medicamentos (Batch Insert)
    if (medicamentos && medicamentos.length > 0) {
      let medSql = 'INSERT INTO Medicamento_Recetado (id_tratamiento, num_linea, nombre_farmaco, dosis, frecuencia) VALUES ';
      const medParams = [];

      medicamentos.forEach((med, index) => {
        const offset = index * 5;
        medParams.push(nuevoIdTratamiento, index + 1, med.nombre_farmaco, med.dosis, med.frecuencia);
        medSql += `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}),`;
      });

      medSql = medSql.slice(0, -1) + ';'; // Formato final de la query
      await client.query(medSql, medParams);
    }

    await client.query('COMMIT'); // Confirmar cambios
    res.status(201).json({ id_consulta: nuevoIdConsulta, id_tratamiento: nuevoIdTratamiento });

  } catch (err) {
    await client.query('ROLLBACK'); // Revertir en caso de error
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'La cita ya fue atendida.' });
    res.status(500).json({ error: 'Error en la transacción de consulta médica.' });
  } finally {
    client.release();
  }
});

// --- PRISMA ORM & UTILIDADES ---

// Endpoint de demostración ORM
app.get('/prueba-orm', async (req, res) => {
  try {
    const resultados = await prisma.due_o.findMany(); // 'due_o' mapeado desde 'dueño'
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Seed Inicial de Administrador (Utilidad)
app.get('/api/auth/crear-admin', async (req, res) => {
  const adminEmail = 'admin@patitas.com';
  const adminPass = 'adminpass';

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminPass, salt);

    // Upsert Empleado
    await db.query(`
      INSERT INTO Empleado (id_empleado, nombre, salario, email, password_hash)
      VALUES (1, 'Dr. Admin', 50000, $1, $2)
      ON CONFLICT (id_empleado) DO UPDATE SET email = $1, password_hash = $2
    `, [adminEmail, password_hash]);

    // Upsert Veterinario
    await db.query(`
      INSERT INTO Veterinario (id_empleado, cedula_profesional, especialidad)
      VALUES (1, '123456', 'Admin')
      ON CONFLICT (id_empleado) DO NOTHING
    `);

    res.send('Administrador inicial configurado correctamente.');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al inicializar admin.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend activo en puerto: ${PORT}`);
});