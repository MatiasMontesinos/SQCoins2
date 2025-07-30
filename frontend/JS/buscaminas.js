function iniciarBuscaminas() {
  const container = document.getElementById('buscaminas-container');
  if (!container) return;

  const board = container.querySelector('#board');
  const bombsCountInput = container.querySelector('#bombsCount');
  const coinsBetInput = container.querySelector('#coinsBet');
  const startBtn = container.querySelector('#startBtn');
  const messageDiv = container.querySelector('#message');

  let bombPositions = [];
  let clickedCells = new Set();
  let gameStarted = false;
  let gameOver = true;
  let bombsCount = 1;
  let coinsBet = 0;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function resetBoard() {
    board.innerHTML = '';
    messageDiv.textContent = '';
    clickedCells.clear();
    bombPositions = [];
  }

  function initializeGame() {
    resetBoard();

    bombsCount = parseInt(bombsCountInput.value);
    coinsBet = parseFloat(coinsBetInput.value);

    if (isNaN(bombsCount) || bombsCount < 1 || bombsCount > 5) {
      alert('Cantidad de bombas inválida (debe ser entre 1 y 5)');
      return false;
    }

    if (isNaN(coinsBet) || coinsBet <= 0) {
      alert('Cantidad de monedas inválida');
      return false;
    }

    const positions = Array.from({ length: 9 }, (_, i) => i);
    shuffle(positions);
    bombPositions = positions.slice(0, bombsCount);

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
    }

    return true;
  }

  function onCellClick(e) {
    if (!gameStarted || gameOver) return;

    const cell = e.currentTarget;
    const index = Number(cell.dataset.index);

    if (clickedCells.has(index)) return;

    clickedCells.add(index);
    cell.classList.add('clicked');

    if (bombPositions.includes(index)) {
      cell.textContent = '💣';
      cell.classList.add('bomb');
      gameOver = true;
      revealAllBombs();
      messageDiv.textContent = `💥 ¡Perdiste! Perdiste ${coinsBet} monedas.`;
      finalizeGame();
    } else {
      cell.textContent = '✅';
    }
  }

  function revealAllBombs() {
    for (let i = 0; i < 9; i++) {
      const cell = board.children[i];
      const index = Number(cell.dataset.index);
      if (bombPositions.includes(index)) {
        cell.textContent = '💣';
        cell.classList.add('bomb');
      }
      cell.removeEventListener('click', onCellClick);
      cell.classList.add('clicked');
    }
  }

  function finalizeGame() {
    gameStarted = false;
    gameOver = true;
    startBtn.textContent = 'Comenzar juego';
  }

  function handleStartOrStop() {
    if (!gameStarted) {
      const ready = initializeGame();
      if (!ready) return;
      gameStarted = true;
      gameOver = false;
      startBtn.textContent = 'Detener';
      messageDiv.textContent = '';
    } else {
      if (!gameOver) {
        const safeClicks = clickedCells.size;
        const bonusPerSafe = 0.2;
        const totalGain = coinsBet + coinsBet * bonusPerSafe * safeClicks;
        messageDiv.textContent = `🎉 ¡Ganaste! Ganaste ${totalGain.toFixed(2)} monedas.`;
        revealAllBombs();
      }
      finalizeGame();
    }
  }

  // Conectamos el botón solo una vez
  startBtn.removeEventListener('click', handleStartOrStop);
  startBtn.addEventListener('click', handleStartOrStop);
}

window.iniciarBuscaminas = iniciarBuscaminas;
