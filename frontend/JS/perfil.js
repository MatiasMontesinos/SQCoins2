function inicializarPerfil() {
  console.log('Perfil inicializado') // CONSOLE LOG
  const perfilContainer = document.querySelector('.perfil-container');
  const contenidoPostLogin = document.getElementById('contenidoPostLogin');
  const nombreUsuarioSpan = document.getElementById('nombreUsuario');
  const apodoUsuarioSpan = document.getElementById('apodoUsuario');
  const fechaNacimientoUsuarioSpan = document.getElementById('fechaNacimientoUsuario');
  const monedasUsuarioSpan = document.getElementById('monedasUsuario');

  // Registro
  const formRegistro = document.getElementById('formRegistro');
  const errorEdad = document.getElementById('errorEdad');

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
      apodo: formRegistro.apellido.value.trim(),
      fechaNacimiento: formRegistro.fechaNacimiento.value,
      password: formRegistro.passwordRegistro.value
    };

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro)
      });
      const data = await res.json();

      if (res.ok) {
        alert('Registro exitoso!');

        nombreUsuarioSpan.textContent = data.usuario.nombre;
        apodoUsuarioSpan.textContent = data.usuario.apodo;
        fechaNacimientoUsuarioSpan.textContent = data.usuario.fechaNacimiento;
        monedasUsuarioSpan.textContent = data.usuario.monedasTotales || '0';

        perfilContainer.style.display = 'none';
        contenidoPostLogin.style.display = 'block';
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
      nombre: formLogin.nombreLogin.value.trim(),
      password: formLogin.passwordLogin.value
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosLogin)
      });
      const data = await res.json();

      if (res.ok) {
        alert('Ingreso exitoso!');

        if (data.usuario) {
          nombreUsuarioSpan.textContent = data.usuario.nombre;
          apodoUsuarioSpan.textContent = data.usuario.apodo;
          fechaNacimientoUsuarioSpan.textContent = data.usuario.fechaNacimiento;
          monedasUsuarioSpan.textContent = data.usuario.monedasTotales || '0';
        } else {
          nombreUsuarioSpan.textContent = datosLogin.nombre;
          apodoUsuarioSpan.textContent = '-';
          fechaNacimientoUsuarioSpan.textContent = '-';
          monedasUsuarioSpan.textContent = '0';
        }

        perfilContainer.style.display = 'none';
        contenidoPostLogin.style.display = 'block';
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error en la conexión');
      console.error(error);
    }
  });
}

// Comandos para editar perfil post log in

function inicializarEventosPerfil() {
  const nombreUsuarioSpan = document.getElementById('nombreUsuario');
  const btnEditar = document.getElementById('btnEditar');
  const formEditar = document.getElementById('formEditar');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelar');
  const nuevoApodoInput = document.getElementById('nuevoApodo');
  const apodoUsuarioSpan = document.getElementById('apodoUsuario');

  if (!btnEditar) return;

  btnEditar.addEventListener('click', () => {
    btnEditar.style.display = 'none';
    formEditar.style.display = 'block';
    nuevoApodoInput.value = apodoUsuarioSpan.textContent.trim();
    nuevoApodoInput.focus();
  });

  btnCancelar.addEventListener('click', () => {
    formEditar.style.display = 'none';
    btnEditar.style.display = 'inline-block';
  });

  btnConfirmar.addEventListener('click', () => {
    const nuevoApodo = nuevoApodoInput.value.trim();

    if (nuevoApodo === '') {
      alert('El apodo no puede estar vacío.');
      return;
    }

    fetch('/api/actualizar-apodo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nombre: nombreUsuarioSpan.textContent.trim(),
        nuevoApodo 
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al actualizar el apodo');
        return res.json();
      })
      .then((data) => {
        apodoUsuarioSpan.textContent = nuevoApodo;
        formEditar.style.display = 'none';
        btnEditar.style.display = 'inline-block';
        alert('Apodo actualizado con éxito.');
      })
      .catch((err) => {
        console.error(err);
        alert('No se pudo actualizar el apodo.');
      });
  });
}
