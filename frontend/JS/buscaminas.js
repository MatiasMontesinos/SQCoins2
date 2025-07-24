(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('buscaminas-container');
    if (!container) {
      console.error('No se encontró el contenedor #buscaminas-container');
      return;
    }

    const board = container.querySelector('#board');
    const bombsCountInput = container.querySelector('#bombsCount');
    const coinsBetInput = container.querySelector('#coinsBet');
    const startBtn = container.querySelector('#startBtn');
    const messageDiv = container.querySelector('#message');

    let bombPositions = [];
    let clickedCells = new Set();
    let gameOver = false;
    let bombsCount = 3;

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function startGame() {
      board.innerHTML = '';
      messageDiv.textContent = '';
      gameOver = false;
      clickedCells.clear();

      bombsCount = parseInt(bombsCountInput.value);
      if (bombsCount < 1 || bombsCount > 5) {
        alert('El número de bombas debe estar entre 1 y 5');
        return;
      }

      const positions = Array.from({length: 9}, (_, i) => i);
      shuffle(positions);

      bombPositions = positions.slice(0, bombsCount);

      for(let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', onCellClick);
        board.appendChild(cell);
      }
    }

    function onCellClick(e) {
      if (gameOver) return;

      const cell = e.currentTarget;
      const index = Number(cell.dataset.index);

      if (clickedCells.has(index)) return;

      clickedCells.add(index);
      cell.classList.add('clicked');

      if (bombPositions.includes(index)) {
        cell.textContent = '💣';
        cell.classList.add('bomb');
        gameOver = true;
        revealBombs();
        messageDiv.textContent = `¡Perdiste! Apostaste ${coinsBetInput.value} monedas.`;
      } else {
        cell.textContent = '✅';

        if (clickedCells.size === 9 - bombsCount) {
          gameOver = true;
          revealBombs(false);
          messageDiv.textContent = `¡Ganaste! Apostaste ${coinsBetInput.value} monedas.`;
        }
      }
    }

    function revealBombs(showAll = true) {
      for(let i = 0; i < 9; i++) {
        const cell = board.children[i];
        if (bombPositions.includes(i)) {
          cell.classList.add('bomb');
          if(showAll && !clickedCells.has(i)) cell.textContent = '💣';
        }
        cell.removeEventListener('click', onCellClick);
        cell.classList.add('clicked');
      }
    }

    // Generar el tablero automáticamente al iniciar
    startGame();

    startBtn.addEventListener('click', startGame);
  });
})();

function iniciarBuscaminas() {
  // Esta función se usa para reiniciar el juego si se carga dinámicamente el script
  const container = document.getElementById('buscaminas-container');
  if (!container) {
    console.error('No se encontró el contenedor #buscaminas-container');
    return;
  }
  const board = container.querySelector('#board');
  const bombsCountInput = container.querySelector('#bombsCount');
  const coinsBetInput = container.querySelector('#coinsBet');
  const startBtn = container.querySelector('#startBtn');
  const messageDiv = container.querySelector('#message');

  let bombPositions = [];
  let clickedCells = new Set();
  let gameOver = false;
  let bombsCount = 3;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function startGame() {
    board.innerHTML = '';
    messageDiv.textContent = '';
    gameOver = false;
    clickedCells.clear();

    bombsCount = parseInt(bombsCountInput.value);
    if (bombsCount < 1 || bombsCount > 5) {
      alert('El número de bombas debe estar entre 1 y 5');
      return;
    }

    const positions = Array.from({length: 9}, (_, i) => i);
    shuffle(positions);

    bombPositions = positions.slice(0, bombsCount);

    for(let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
    }
  }

  function onCellClick(e) {
    if (gameOver) return;

    const cell = e.currentTarget;
    const index = Number(cell.dataset.index);

    if (clickedCells.has(index)) return;

    clickedCells.add(index);
    cell.classList.add('clicked');

    if (bombPositions.includes(index)) {
      cell.textContent = '💣';
      cell.classList.add('bomb');
      gameOver = true;
      revealBombs();
      messageDiv.textContent = `¡Perdiste! Apostaste ${coinsBetInput.value} monedas.`;
    } else {
      cell.textContent = '✅';

      if (clickedCells.size === 9 - bombsCount) {
        gameOver = true;
        revealBombs(false);
        messageDiv.textContent = `¡Ganaste! Apostaste ${coinsBetInput.value} monedas.`;
      }
    }
  }

  function revealBombs(showAll = true) {
    for(let i = 0; i < 9; i++) {
      const cell = board.children[i];
      if (bombPositions.includes(i)) {
        cell.classList.add('bomb');
        if(showAll && !clickedCells.has(i)) cell.textContent = '💣';
      }
      cell.removeEventListener('click', onCellClick);
      cell.classList.add('clicked');
    }
  }

  startGame();

  startBtn.addEventListener('click', startGame);
}

window.iniciarBuscaminas = iniciarBuscaminas;
