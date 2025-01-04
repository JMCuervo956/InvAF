import express from 'express';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';	
import crypto from 'crypto';
import { pool } from './db.js';		
import bcryptjs from 'bcryptjs';		

const app = express();
const __filename = fileURLToPath(import.meta.url);		
const __dirname = path.dirname(__filename);		

// Configuración de la vista (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Habilitar archivos estáticos (CSS, JS, imágenes)
//app.use(express.static(path.join(process.cwd(), 'public')));

app.use(express.static(path.join(__dirname, '../public')));

// Middleware para procesar los datos del formulario
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: 'miSecreto', // Cambia esto por un secreto más seguro
  resave: false,
  saveUninitialized: true,
}));

// Ruta principal para mostrar el formulario
app.get('/', (req, res) => {
  res.render('index');  // Muestra el formulario de login
});

// Ruta del menú (solo accesible si el usuario está autenticado)
app.get('/menu', (req, res) => {
  // Verifica si el usuario está autenticado
  if (req.session.user) {
    console.log('si')
    res.render('menu', { usuario: req.session.user });
  } else {
    console.log('no')
    res.redirect('/'); // Si no está autenticado, redirige al login
  }
});


// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error al cerrar sesión.');
    }
    res.redirect('/'); // Redirige al login después de cerrar sesión
  });
});

app.get('/inventarios', (req, res)=>{
  const userUser = req.session.unidad;
  res.render('inventarios', { userUser });
})

app.post('/inventarios', async (req, res) => {
  try {
      const { CodActivo, DesGen, DesAct, observ, Estado, Propio } = req.body;

//        if (!CodActivo || !DesGen || !DesAct || !observ || !Estado || !Propio) {
//            return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
//        }

      // Verificar si el activo ya existe
      const [rows] = await pool.execute('SELECT * FROM tbl_inventarios WHERE id_activo = ?', [CodActivo]);

      if (rows.length > 0) {
          // Si el registro ya existe, devolver mensaje y opciones
          return res.json({ 
              status: 'exists', 
              message: 'El registro ya existe.',
              codActivo: CodActivo ,
              options: {
                  delete: true,  // Opción para eliminar
                  keep: true     // Opción para mantener
              }
          });
      }

      // Si el registro no existe, insertarlo en la base de datos
      await pool.execute('INSERT INTO tbl_inventarios (id_activo, desgen, desact, desobs, estado, propio) VALUES (?, ?, ?, ?, ?, ?)', [CodActivo, DesGen, DesAct, observ, Estado, Propio ]);
      res.json({ status: 'success', message: '¡Activo registrado correctamente!' });

  } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ status: 'error', message: 'Error en el servidor' });
  }
});

// inventarios ELIMINAR

app.post('/inventeli', async (req, res) => {
  try {
      const ids = req.body.CodActivo;

      // Log para depuración

      const [rows] =  await pool.execute('delete from tbl_inventarios WHERE id_activo = ?', [ids]);
      return res.json({
          status: 'success',
          title: 'Borrado Exitoso.',
          message: '¡Registro Exitoso! BD'
      });
  } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED') {
          return res.json({
              status: 'error',
              title: 'Borrado No Exitoso',
              message: 'No se puede eliminar la pregunta porque tiene dependencia de OPCIONES.'
          });
      }
      // Para cualquier otro tipo de error
      return res.json({
          status: 'error',
          title: 'Error de Borrado',
          message: `Error: ${error.code}`
      });
  }
});

// [login] - Autenticacion

app.post('/auth', async (req, res) => {
  // variables de ejs
  const { user, pass } = req.body;

  // Valida Usuario
  const tableName = 'users';
  const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE user = ?`, [user]);
  
  if (rows.length === 0) {
      return res.json({ status: 'error', message: 'Usuario no encontrado' });
  }
  const userRecord = rows[0];
  const passwordMatch = await bcryptjs.compare(pass, userRecord.pass);

  if (!passwordMatch) {
      return res.json({ status: 'error', message: 'Contraseña incorrecta' });
  }

  req.session.loggedin = true;
  req.session.user = userRecord.user; // mantener la información del usuario entre diferentes solicitudes durante su sesión (COMPARTIR).
  req.session.name = userRecord.name; // mantener la información del usuario entre diferentes solicitudes durante su sesión (COMPARTIR).
  req.session.rol = userRecord.rol;
  req.session.pass = userRecord.pass;

  return res.json({ status: 'success', message: '!LOGIN Correcto!' });
});


// Configurar el puerto en el que el servidor escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
