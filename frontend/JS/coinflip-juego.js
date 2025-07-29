(function coinflipJuegoModule() {
  // Limpia inicialización previa
  if (window.coinflipJuegoInicializado) {
    console.warn("coinflip-juego.js ya estaba activo. Reiniciando...");
    // Aquí podrías limpiar listeners/timers previos si los tuvieras
  }
  window.coinflipJuegoInicializado = true;

  // Funciones globales para los botones inline
  window.volverAlInicio = () => {
    if (typeof cargarPagina === 'function') {
      cargarPagina('pagina2-juego1.html', '/coinflip');
    } else {
      window.location.href = '/coinflip';
    }
  };

  window.cancelarPartida = async () => {
    try {
      const salaID = parseInt(localStorage.getItem('salaCoinflip'), 10);
      const usuarioID = parseInt(localStorage.getItem('usuarioID'), 10);
      const res = await fetch('/coinflip/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idSala: salaID, idUsuario: usuarioID })
      });
      if (!res.ok) throw new Error('No se pudo cancelar');
      await res.json();
      volverAlInicio();
    } catch (err) {
      console.error('Error al cancelar:', err);
      alert('No se pudo cancelar la sala');
    }
  };

  // Handler principal
  async function coinflipJuegoHandler() {
    // Obtener y validar sala
    const salaRaw = localStorage.getItem('salaCoinflip');
    if (!salaRaw) {
      alert('No hay sala activa. Volviendo al listado de salas.');
      return volverAlInicio();
    }
    const idSala = parseInt(salaRaw, 10);
    if (isNaN(idSala)) {
      alert('ID de sala inválido. Redirigiendo...');
      return volverAlInicio();
    }

    // Obtener usuario
    const userRaw = localStorage.getItem('usuarioID');
    if (!userRaw) {
      alert('Usuario no logueado');
      throw new Error('No hay usuario');
    }
    const usuarioID = parseInt(userRaw, 10);

    // Animaciones
    function comenzarEspera() {
      const moneda = document.getElementById('moneda');
      moneda.style.animation = 'girarMoneda 1s linear infinite';
      moneda.style.transform = 'rotateY(0deg)';
    }
    function comenzarPartida(ganoRojo) {
      const moneda = document.getElementById('moneda');
      moneda.style.animation = 'none';
      moneda.style.transform = ganoRojo ? 'rotateY(0deg)' : 'rotateY(180deg)';
    }

    // Actualizar UI según estado de sala
    function actualizarInterfazSala(sala) {
      document.getElementById('jugador-rojo').textContent = sala.creador || '---';
      document.getElementById('jugador-negro').textContent = sala.oponente || 'Esperando...';

      const btnCancelar = document.getElementById('cancelar-btn');
      if (usuarioID === sala.id_jugador1) {
        btnCancelar.style.display = 'block';
        btnCancelar.disabled = !!sala.id_jugador2;
      } else {
        btnCancelar.style.display = 'none';
      }

      if (!sala.id_jugador2) {
        comenzarEspera();
        // Auto-unirse si no eres el creador
        if (usuarioID !== sala.id_jugador1) {
          unirseASala();
        }
      } else if (!sala.id_ganador) {
        // sin ganador aún: moneda estática
        const moneda = document.getElementById('moneda');
        moneda.style.animation = 'none';
        moneda.style.transform = 'rotateY(0deg)';
      } else {
        const ganoRojo = sala.id_ganador === sala.id_jugador1;
        comenzarPartida(ganoRojo);
      }
    }

    // Traer sala del backend
    async function fetchSala() {
      try {
        const res = await fetch(`/coinflip/sala/${idSala}`);
        if (!res.ok) throw new Error('Sala no encontrada');
        const sala = await res.json();
        actualizarInterfazSala(sala);
      } catch (err) {
        console.error('Error al obtener sala:', err);
        document.getElementById('jugador-rojo').textContent = 'Error';
        document.getElementById('jugador-negro').textContent = 'Error';
      }
    }

    // Unirse a sala
    async function unirseASala() {
      try {
        const res = await fetch('/coinflip/unirse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: usuarioID, id_sala_juego1: idSala })
        });
        const data = await res.json();
        if (data.status === 'ok' || data.status === 'resuelto') {
          await fetchSala();
        } else {
          alert('Error: ' + (data.error || 'No se pudo unir'));
        }
      } catch (err) {
        console.error('Error al unirse:', err);
        alert('Error al unirse a sala: ' + err.message);
      }
    }

    // Atachar listener al botón cancelar
    const btnCancelar = document.getElementById('cancelar-btn');
    if (btnCancelar) btnCancelar.onclick = window.cancelarPartida;

    // Primera carga
    await fetchSala();
  }

  // Ejecuta inmediatamente
  coinflipJuegoHandler();
})();
