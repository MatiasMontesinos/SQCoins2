(function() {
  const CreateButton = document.getElementById("CreateButton");
  const createMenu = document.getElementById("crearMenu");

  if (CreateButton && createMenu) {
    CreateButton.addEventListener("click", () => {
      createMenu.style.display = createMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.getElementById('CrearSorteo').addEventListener('click', crearSorteo);
  }
})();

function listarSorteos() {
  fetch('/api/sorteos/activos')
    .then(res => res.json())
    .then(sorteos => {
      const contenedor = document.getElementById('sorteos');
      contenedor.innerHTML = '';

      if (sorteos.length === 0) {
        contenedor.innerHTML = '<p>No hay sorteos activos.</p>';
        return;
      }

      sorteos.forEach(s => {
        const div = document.createElement('div');
        div.className = 'sorteo-card';
        div.innerHTML = `
          <p><strong>Creador:</strong> ${s.creador}</p>
          <p><strong>Cantidad sorteada:</strong> ${s.cantidad_sorteo} SQCoins</p>
          <p><strong>Participantes:</strong> ${s.participantes}/${s.limite_participantes}</p>
          <button onclick="unirseSorteo(${s.id_sorteo})">Unirse</button>
        `;
        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error('Error al listar sorteos:', err));
}

function crearSorteo() {
  const cantidad = parseInt(document.getElementById('cantidadSortear').value);
  const limite = parseInt(document.getElementById('limiteParticipantes').value);
  const id_usuario = getUsuarioID();

  if (!cantidad || !limite) {
    alert("Completá todos los campos");
    return;
  }

  fetch('/api/sorteos/crear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cantidad_sorteo: cantidad,
      limite_participantes: limite,
      id_creador: id_usuario
    })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear sorteo');
    alert('Sorteo creado con éxito');
    location.reload();
  })
  .catch(err => {
    console.error('Error al crear sorteo:', err);
    alert(err.message || 'Error desconocido');
  });
}

function unirseSorteo(idSorteo) {
  const id_usuario = getUsuarioID();

  fetch('/api/sorteos/unirse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario, id_sorteo: idSorteo })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al unirse');
    alert('¡Te uniste al sorteo!');
    location.reload();
  })
  .catch(err => {
    console.error('Error al unirse:', err);
    alert(err.message || 'Error al unirse al sorteo');
  });
}

function getUsuarioID() {
  const id = localStorage.getItem('usuarioID');
  if (!id) {
    alert('Usuario no logueado.');
    throw new Error('Usuario no logueado');
  }
  return parseInt(id);
}

// Carga inicial
listarSorteos();
