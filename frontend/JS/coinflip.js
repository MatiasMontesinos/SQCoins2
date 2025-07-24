(function() {
    // Busca el botón y el menú
    const CreateButton = document.getElementById("CreateButton");
    const createMenu = document.getElementById("createMenu"); // Asegúrate de que este ID exista en tu HTML

    // Solo si el botón y el menú existen, adjuntamos el event listener
    if (CreateButton && createMenu) {
        function toggleMenu() {
            if (createMenu.style.display === 'block') {
                createMenu.style.display = 'none';
            } else {
                createMenu.style.display = 'block';
            }
        }
        CreateButton.addEventListener("click", toggleMenu);
        document.getElementById('CrearSala').addEventListener('click', crearSala)
    }
})();

fetch('/coinflip/salas')
  .then(res => res.json())
  .then(salas => {
    const contenedor = document.getElementById('salas');
    contenedor.innerHTML = ''; // limpiar

    if (salas.length === 0) {
      contenedor.innerHTML = '<p>No hay salas activas.</p>';
      return;
    }

    salas.forEach(sala => {
      const div = document.createElement('div');
      div.className = 'sala';

      div.innerHTML = `
        <p><strong>Creador:</strong> ${sala.creador}</p>
        <p><strong>Apuesta:</strong> ${sala.cant_apostada} SQCoins</p>
        <button onclick="unirseASalaSPA(${sala.id_sala_juego1})">Unirse</button>
      `;


      contenedor.appendChild(div);
    });
  })
  .catch(err => console.error('Error al listar salas:', err));

function crearSala() {
  const monto = parseInt(document.getElementById('montoApuesta').value);
  if (isNaN(monto) || monto <= 0) {
    alert('Ingresá un monto válido');
    return;
  }

  fetch('/coinflip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario: getUsuarioID(),  // Asegúrate que esta función exista y devuelva el ID correcto
      monto: monto
    })
  })
  .then(res => res.json())
  .then(data => {
  if (data.status === 'sala_creada') {
    localStorage.setItem('salaCoinflip', data.sala.id_sala_juego1); // guarda ID de sala
    cargarPagina('coinflip-juego.html', '/coinflip-juego'); // navega dentro del SPA
  } else {
    alert('Error creando sala: ' + (data.error || 'desconocido'));
  }
})
  .catch(err => console.error('Error al crear sala:', err));
}

//A IMPLEMENTAR, se necesita que se guarde en localStorage el id del usuario cuando hace el login
function getUsuarioID() {
  const id = localStorage.getItem('usuarioID');
  if (!id) {
    alert('Usuario no logueado. No se pudo obtener el ID.');
    throw new Error('Usuario no logueado');
  }
  return parseInt(id);
}

function unirseASalaSPA(idSala) {
  localStorage.setItem('salaCoinflip', idSala); // guardamos ID de sala
  cargarPagina('coinflip-juego.html', '/coinflip-juego'); // navegamos al juego
}
