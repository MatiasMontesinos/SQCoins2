// Al inicio de coinflip-juego.js
const salaID = localStorage.getItem('salaCoinflip');
if (!salaID) {
  alert('No hay sala activa. Volviendo al listado de salas.');
  cargarPagina('pagina2-juego1.html', '/coinflip'); // Ajusta ruta SPA si es necesario
  throw new Error('No hay sala activa'); // detiene ejecución
}

const idSala = parseInt(salaID);
if (!idSala) {
  alert('No se encontró la sala. Redirigiendo...');
  window.location.href = '/coinflip';
}

function getUsuarioID() {
  const id = localStorage.getItem('usuarioID');
  if (!id) {
    alert('Usuario no logueado');
    throw new Error('No hay usuario');
  }
  return parseInt(id);
}

const usuarioID = getUsuarioID();

function actualizarInterfazSala(sala) {
  document.getElementById('jugador-rojo').textContent = sala.creador;
  document.getElementById('jugador-negro').textContent = sala.oponente || 'Esperando...';

  const btnCancelar = document.getElementById('cancelar-btn');

  if (usuarioID === Number(sala.id_jugador1)) {
    btnCancelar.style.display = 'block';
    btnCancelar.disabled = sala.id_jugador2 ? true : false;
  } else {
    btnCancelar.style.display = 'none';
  }

  if (!sala.id_jugador2) {
    comenzarEspera();
  }

  if (sala.id_jugador1 === usuarioID && sala.id_jugador2) {
    iniciarCoinflip(sala);
  } else if (sala.id_jugador1 !== usuarioID && !sala.id_jugador2) {
    unirseASala(idSala);
  } else if (sala.id_ganador) {
    iniciarCoinflip(sala);
  }
}

fetch(`/coinflip/sala/${idSala}`)
  .then(res => {
    if (!res.ok) throw new Error('Sala no encontrada');
    return res.json();
  })
  .then(sala => {
    actualizarInterfazSala(sala);
  })
  .catch(err => {
    console.error(err);
    document.getElementById('jugador-rojo').textContent = 'Error';
    document.getElementById('jugador-negro').textContent = 'Error';
  });

function unirseASala(id) {
  console.log("Enviando solicitud para unirse a la sala...", usuarioID, id);
  fetch('/coinflip/unirse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: usuarioID, id_sala_juego1: id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok' || data.status === 'resuelto') {
      // Volver a obtener los datos actualizados de la sala
      fetch(`/coinflip/sala/${id}`)
        .then(res => res.json())
        .then(salaActualizada => {
          actualizarInterfazSala(salaActualizada); // Esto ahora incluye el estado actualizado del botón
        });
    } else {
      alert('Error: ' + (data.error || 'No se pudo unir'));
    }
  })
  .catch(err => {
    console.error('Error al unirse a sala:', err);
    alert('Error al unirse a sala: ' + err.message);
  });
}

function comenzarPartida(ganoRojo) {
  const moneda = document.getElementById('moneda');
  moneda.style.animation = 'none'; // detiene animación
  moneda.style.transform = ganoRojo ? 'rotateY(0deg)' : 'rotateY(180deg)';
}

function comenzarEspera() {
  const moneda = document.getElementById('moneda');
  moneda.style.animation = 'girarMoneda 1s linear infinite';
  moneda.style.transform = 'rotateY(0deg)';
}

function iniciarCoinflip(sala) {
  document.getElementById('jugador-rojo').textContent = sala.id_jugador1 === usuarioID ? 'Tú' : sala.creador || 'Jugador Rojo';
  document.getElementById('jugador-negro').textContent = sala.id_jugador2 === usuarioID ? 'Tú' : sala.oponente || 'Jugador Negro';

  if (!sala.id_jugador2) {
    comenzarEspera();
  } else if (!sala.id_ganador) {
    const moneda = document.getElementById('moneda');
    moneda.style.animation = 'none';
    moneda.style.transform = 'rotateY(0deg)';
  } else {
    const ganoRojo = sala.id_ganador === sala.id_jugador1;
    comenzarPartida(ganoRojo);
  }
}

function volverAlInicio() {
  if (typeof cargarPagina === 'function') {
    cargarPagina('pagina2-juego1.html', '/coinflip');
  } else {
    window.location.href = '/coinflip'; // Fallback
  }
}

function cancelarPartida() {
  fetch('/coinflip/cancelar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      idSala: idSala,
      idUsuario: getUsuarioID()
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('No se pudo cancelar la sala');
    return res.json();
  })
  .then(data => {
    console.log('Sala cancelada:', data);
    volverAlInicio();
  })
  .catch(err => {
    console.error('Error al cancelar sala:', err);
    alert('No se pudo cancelar la sala');
  });
}
