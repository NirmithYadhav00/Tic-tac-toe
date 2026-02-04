let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let gameMode = 'ai';
let difficulty = 'medium';
let scores = {
    X: 0,
    O: 0,
    draws: 0
};

const HUMAN = 'X';
const AI = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('gameStatus');
const resetButton = document.getElementById('resetBtn');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreDrawDisplay = document.getElementById('scoreDraw');
const modeButtons = document.querySelectorAll('.mode-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const difficultySelection = document.querySelector('.difficulty-selection');
const player1Label = document.getElementById('player1Label');
const player2Label = document.getElementById('player2Label');

function checkWinner(board, player) {
    return winningConditions.some(condition =>
        condition.every(index => board[index] === player)
    );
}

function getEmptyCells(board) {
    return board
        .map((cell, index) => cell === '' ? index : null)
        .filter(val => val !== null);
}

function minimax(board, player, depth) {
    const emptyCells = getEmptyCells(board);

    if (checkWinner(board, AI)) return 10 - depth;
    if (checkWinner(board, HUMAN)) return depth - 10;
    if (emptyCells.length === 0) return 0;

    if (player === AI) {
        let bestScore = -Infinity;
        for (let index of emptyCells) {
            board[index] = AI;
            let score = minimax(board, HUMAN, depth + 1);
            board[index] = '';
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let index of emptyCells) {
            board[index] = HUMAN;
            let score = minimax(board, AI, depth + 1);
            board[index] = '';
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
}

function getBestMove() {
    const emptyCells = getEmptyCells(gameBoard);

    if (difficulty === 'easy' && Math.random() < 0.7) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    if (difficulty === 'medium' && Math.random() < 0.5) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    let bestScore = -Infinity;
    let bestMove = emptyCells[0];

    for (let index of emptyCells) {
        gameBoard[index] = AI;
        let score = minimax(gameBoard, HUMAN, 0);
        gameBoard[index] = '';
        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }

    return bestMove;
}

function aiMove() {
    if (!gameActive || gameMode !== 'ai') return;

    statusDisplay.textContent = 'AI is thinking...';
    statusDisplay.classList.add('thinking');

    setTimeout(() => {
        const bestMove = getBestMove();
        const cell = cells[bestMove];
        updateCell(cell, bestMove);
        statusDisplay.classList.remove('thinking');
        checkResult();
    }, 500);
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameBoard[clickedCellIndex] !== '' || !gameActive) return;
    if (gameMode === 'ai' && currentPlayer === AI) return;

    updateCell(clickedCell, clickedCellIndex);
    checkResult();

    if (gameActive && gameMode === 'ai' && currentPlayer === AI) {
        aiMove();
    }
}

function updateCell(cell, index) {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase(), 'disabled');
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent =
        gameMode === 'ai'
            ? currentPlayer === HUMAN ? 'Your Turn' : "AI's Turn"
            : `Player ${currentPlayer}'s Turn`;
}

function checkResult() {
    for (let [a, b, c] of winningConditions) {
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            handleWin([a, b, c]);
            return;
        }
    }

    if (!gameBoard.includes('')) {
        handleDraw();
        return;
    }

    changePlayer();
}

function handleWin(winningCombination) {
    gameActive = false;

    if (gameMode === 'ai') {
        statusDisplay.textContent =
            currentPlayer === HUMAN ? 'You Win! 🎉' : 'AI Wins! 🤖';
        statusDisplay.classList.add(currentPlayer === HUMAN ? 'win' : 'lose');
    } else {
        statusDisplay.textContent = `Player ${currentPlayer} Wins! 🎉`;
        statusDisplay.classList.add('win');
    }

    winningCombination.forEach(i => cells[i].classList.add('winner'));
    scores[currentPlayer]++;
    updateScoreDisplay();
    disableAllCells();
}

function handleDraw() {
    gameActive = false;
    statusDisplay.textContent = "It's a Draw! 🤝";
    statusDisplay.classList.add('draw');
    scores.draws++;
    updateScoreDisplay();
    disableAllCells();
}

function disableAllCells() {
    cells.forEach(cell => cell.classList.add('disabled'));
}

function updateScoreDisplay() {
    scoreXDisplay.textContent = scores.X;
    scoreODisplay.textContent = scores.O;
    scoreDrawDisplay.textContent = scores.draws;
}

function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];

    statusDisplay.textContent =
        gameMode === 'ai' ? 'Your Turn' : "Player X's Turn";

    statusDisplay.classList.remove('win', 'draw', 'lose', 'thinking');

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner', 'disabled');
    });
}

function setGameMode(mode) {
    gameMode = mode;

    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'ai') {
        difficultySelection.classList.add('show');
        player1Label.textContent = 'You (X)';
        player2Label.textContent = 'AI (O)';
    } else {
        difficultySelection.classList.remove('show');
        player1Label.textContent = 'Player X';
        player2Label.textContent = 'Player O';
    }

    resetGame();
}

function setDifficulty(level) {
    difficulty = level;

    difficultyButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === level);
    });

    resetGame();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
modeButtons.forEach(btn =>
    btn.addEventListener('click', () => setGameMode(btn.dataset.mode))
);
difficultyButtons.forEach(btn =>
    btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty))
);
statusDisplay.textContent = 'Your Turn';
