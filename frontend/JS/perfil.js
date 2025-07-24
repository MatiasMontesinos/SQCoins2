function inicializarPerfil() {
  verificarSesion();

  // Para eliminar usuario
  const btnEliminarCuenta = document.getElementById('btnEliminarCuenta');
  if (btnEliminarCuenta) {
    btnEliminarCuenta.addEventListener('click', async () => {
    const confirmar = confirm('¿Estás seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.');

    if (!confirmar) return;

    try {
      const res = await fetch('/api/eliminar-cuenta', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        alert('Tu cuenta fue eliminada correctamente.');
        mostrarFormulario(); // vuelve al formulario de login/registro
      } else {
        alert(data.error || 'Error al eliminar la cuenta.');
      }
    } catch (error) {
      console.error(error);
      alert('Error en la conexión al intentar eliminar la cuenta.');
    }
  });
}


  const perfilContainer = document.querySelector('.perfil-container');
  const contenidoPostLogin = document.getElementById('contenidoPostLogin');
  const nombreUsuarioSpan = document.getElementById('nombreUsuario');
  const usernameUsuarioSpan = document.getElementById('usernameUsuario');
  const fechaNacimientoUsuarioSpan = document.getElementById('fechaNacimientoUsuario');
  const monedasUsuarioSpan = document.getElementById('monedasUsuario');
  const errorEdad = document.getElementById('errorEdad');

  // Registro
  const formRegistro = document.getElementById('formRegistro');
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar edad >= 18 años
    const fechaNacimiento = new Date(formRegistro.fechaNacimiento.value);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    const dia = hoy.getDate() - fechaNacimiento.getDate();
    if (edad < 18 || (edad === 18 && (mes < 0 || (mes === 0 && dia < 0)))) {
      errorEdad.style.display = 'block';
      return;
    }
    errorEdad.style.display = 'none';

    const datosRegistro = {
      nombre: formRegistro.nombre.value.trim(),
      username: formRegistro.username.value.trim(),
      fechaNacimiento: formRegistro.fechaNacimiento.value,
      password: formRegistro.passwordRegistro.value
    };

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        alert('Registro exitoso!');
        mostrarUsuario(data.usuario);
      } else {
        alert(data.error || 'Error al registrar');
      }
    } catch (error) {
      alert('Error en la conexión');
      console.error(error);
    }
  });

  // Login
  const formLogin = document.getElementById('formLogin');
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosLogin = {
      username: formLogin.usernameLogin.value.trim(),
      password: formLogin.passwordLogin.value
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosLogin),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        alert('Ingreso exitoso!');
        mostrarUsuario(data.usuario);
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error en la conexión');
      console.error(error);
    }
  });

  // Logout botón
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });
        alert('Sesión cerrada correctamente');
        mostrarFormulario();
      } catch (error) {
        alert('Error cerrando sesión');
        console.error(error);
      }
    });
  }
}

async function verificarSesion() {
  try {
    const res = await fetch('/api/sesion-activa', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      mostrarUsuario(data.usuario);
    } else {
      mostrarFormulario();
    }
  } catch {
    mostrarFormulario();
  }
}

function mostrarUsuario(usuario) {
  if (usuario.id) {
    localStorage.setItem('usuarioID', usuario.id);
  }

  const perfilContainer = document.querySelector('.perfil-container');
  const contenidoPostLogin = document.getElementById('contenidoPostLogin');
  const nombreUsuarioSpan = document.getElementById('nombreUsuario');
  const usernameUsuarioSpan = document.getElementById('usernameUsuario');
  const fechaNacimientoUsuarioSpan = document.getElementById('fechaNacimientoUsuario');
  const monedasUsuarioSpan = document.getElementById('monedasUsuario');

  nombreUsuarioSpan.textContent = usuario.nombre;
  usernameUsuarioSpan.textContent = usuario.username;
  fechaNacimientoUsuarioSpan.textContent = usuario.fechaNacimiento;
  monedasUsuarioSpan.textContent = usuario.monedasTotales || '0';

  perfilContainer.style.display = 'none';
  contenidoPostLogin.style.display = 'block';
}

function mostrarFormulario() {
  document.querySelector('.perfil-container').style.display = 'block';
  document.getElementById('contenidoPostLogin').style.display = 'none';
}

// --- Aquí sigue tu función para editar username (sin cambios) ---

function inicializarEventosPerfil() {
  const nombreUsuarioSpan = document.getElementById('nombreUsuario');
  const btnEditar = document.getElementById('btnEditar');
  const formEditar = document.getElementById('formEditar');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelar');
  const nuevoUsernameInput = document.getElementById('nuevoUsername');
  const usernameUsuarioSpan = document.getElementById('usernameUsuario');

  if (!btnEditar) return;

  btnEditar.addEventListener('click', () => {
    btnEditar.style.display = 'none';
    formEditar.style.display = 'block';
    nuevoUsernameInput.value = usernameUsuarioSpan.textContent.trim();
    nuevoUsernameInput.focus();
  });

  btnCancelar.addEventListener('click', () => {
    formEditar.style.display = 'none';
    btnEditar.style.display = 'inline-block';
  });

  btnConfirmar.addEventListener('click', () => {
    const nuevoUsername = nuevoUsernameInput.value.trim();

    if (nuevoUsername === '') {
      alert('El username no puede estar vacío.');
      return;
    }

    fetch('/api/actualizar-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nombre: nombreUsuarioSpan.textContent.trim(),
        nuevoUsername 
      }),
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al actualizar el username');
        return res.json();
      })
      .then((data) => {
        usernameUsuarioSpan.textContent = nuevoUsername;
        formEditar.style.display = 'none';
        btnEditar.style.display = 'inline-block';
        alert('Username actualizado con éxito.');
      })
      .catch((err) => {
        console.error(err);
        alert('No se pudo actualizar el username.');
      });
  });
}
