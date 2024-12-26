import express from 'express';
import path from 'path';
import session from 'express-session';

const app = express();

// Configuración de la vista (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Habilitar archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(process.cwd(), 'public')));

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

// Ruta para procesar el login
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  // Validar usuario y contraseña (aquí es donde harías la validación)
  if (usuario === 'admin' && contrasena === '1234') {
    // Guardar en la sesión que el usuario está autenticado
    req.session.usuario = usuario;
    res.redirect('/menu'); // Redirige a la página del menú
  } else {
    res.send('Usuario o contraseña incorrectos.');
  }
});

// Ruta del menú (solo accesible si el usuario está autenticado)
app.get('/menu', (req, res) => {
  // Verifica si el usuario está autenticado
  if (req.session.usuario) {
    res.render('menu', { usuario: req.session.usuario });
  } else {
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

// Configurar el puerto en el que el servidor escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
