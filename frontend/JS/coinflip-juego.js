if (!localStorage.getItem('usuarioID')) {
  localStorage.setItem('usuarioID', '7'); // ID de ejemplo para pruebas
}

const idSala = parseInt(localStorage.getItem('salaCoinflip'));
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

fetch(`/coinflip/sala/${idSala}`)
  .then(res => {
    if (!res.ok) throw new Error('Sala no encontrada');
    return res.json();
  })
  .then(sala => {
    document.getElementById('jugador-rojo').textContent = sala.creador;
    document.getElementById('jugador-negro').textContent = sala.oponente || 'Esperando...';

    const idJugador1 = Number(sala.id_jugador1);
    const idJugador2 = sala.id_jugador2 ? Number(sala.id_jugador2) : null;

    if (idJugador1 === usuarioID && !idJugador2) {
      document.getElementById('cancelar-btn').style.display = 'block';
    } else {
      document.getElementById('cancelar-btn').style.display = 'none';
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
  })
  .catch(err => {
    console.error(err);
    document.getElementById('jugador-rojo').textContent = 'Error';
    document.getElementById('jugador-negro').textContent = 'Error';
  });

function unirseASala(id) {
  fetch('/coinflip/unirse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: usuarioID, id_sala_juego1: idSala })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      iniciarCoinflip({
        id_jugador1: data.id_jugador1,
        id_jugador2: data.id_jugador2,
        cant_apostada: data.cant,
        id_sala_juego1: idSala,
        id_ganador: data.ganador,
        creador: data.creador,
        oponente: data.oponente
      });
    } else {
      alert('Error: ' + (data.error || 'No se pudo unir'));
    }
  })
  .catch(err => {console.error('Error al unirse a sala:', err);
    alert('Error al unirse a sala: ' + err.message);});
  console.log("Enviando solicitud para unirse a la sala...", usuarioID, idSala);
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
  // Actualizar nombres
  document.getElementById('jugador-rojo').textContent = sala.id_jugador1 === usuarioID ? 'Tú' : sala.creador || 'Jugador Rojo';
  document.getElementById('jugador-negro').textContent = sala.id_jugador2 === usuarioID ? 'Tú' : sala.oponente || 'Jugador Negro';

  if (!sala.id_jugador2) {
    // Si NO hay segundo jugador, mostrar animación esperando
    comenzarEspera();
  } else if (!sala.id_ganador) {
    // Si hay 2 jugadores pero no hay ganador, mostrar moneda estática (sin animación)
    const moneda = document.getElementById('moneda');
    moneda.style.animation = 'none';
    moneda.style.transform = 'rotateY(0deg)';
  } else {
    // Ya hay ganador, mostrar resultado
    const ganoRojo = sala.id_ganador === sala.id_jugador1;
    comenzarPartida(ganoRojo);
  }
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

function volverAlInicio() {
  if (typeof cargarPagina === 'function') {
    cargarPagina('pagina2-juego1.html', '/coinflip');
  } else {
    window.location.href = '/coinflip'; // Fallback en caso de error
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
    if (!res.ok) {
      throw new Error('No se pudo cancelar la sala');
    }
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
