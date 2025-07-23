// Carga una página HTML en el contenedor principal
function cargarPagina(archivo, url) {
  fetch(`Paginas/${archivo}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('contenido').innerHTML = html;
      history.pushState({ archivo }, '', url);
    })
    .catch(() => {
      document.getElementById('contenido').innerHTML = '<p>Error al cargar la página.</p>';
    });
}

// Escucha clics en cualquier enlace con data-pagina
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-pagina]');
  if (link) {
    e.preventDefault();
    const archivo = link.dataset.pagina;
    const url = link.getAttribute('href');
    cargarPagina(archivo, url);
  }
});

// Carga navbar una vez y contenido inicial
window.addEventListener('DOMContentLoaded', () => {
  fetch('Paginas/navbar.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('navbar').innerHTML = html;

      // Cargar contenido correspondiente a la URL actual
      const rutas = {
        '/principal': 'pagina1-principal.html',
        '/coinflip': 'pagina2-juego1.html',
        '/buscaminas': 'pagina3-juego2.html',
        '/sorteo': 'pagina4-sorteo.html',
        '/perfil': 'pagina5-perfil.html'
      };
      const path = window.location.pathname;
      const archivo = rutas[path] || 'pagina1-principal.html';
      cargarPagina(archivo, path);
    });
});

// Manejo de botones Atrás / Adelante del navegador
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.archivo) {
    fetch(`Paginas/${e.state.archivo}`)
      .then(res => res.text())
      .then(html => {
        document.getElementById('contenido').innerHTML = html;
      });
  }
});
