// ========================================
// GAME STATE VARIABLES
// ========================================

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let gameMode = 'ai'; // 'ai' or '2player'
let difficulty = 'medium'; // 'easy', 'medium', 'hard'
let scores = {
    X: 0,
    O: 0,
    draws: 0
};

const HUMAN = 'X';
const AI = 'O';

// ========================================
// WIN CONDITION PATTERNS
// ========================================

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

// ========================================
// DOM ELEMENTS
// ========================================

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

// ========================================
// AI LOGIC - MINIMAX ALGORITHM
// ========================================

/**
 * Check if someone won
 * @param {Array} board - Current board state
 * @param {string} player - Player to check ('X' or 'O')
 * @returns {boolean}
 */
function checkWinner(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

/**
 * Get all empty cell indices
 * @param {Array} board - Current board state
 * @returns {Array} Array of empty indices
 */
function getEmptyCells(board) {
    return board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
}

/**
 * Minimax algorithm for optimal AI moves
 * @param {Array} board - Current board state
 * @param {string} player - Current player
 * @param {number} depth - Current recursion depth
 * @returns {number} Best score for this move
 */
function minimax(board, player, depth) {
    const emptyCells = getEmptyCells(board);

    // Check terminal states
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

/**
 * Get best move for AI based on difficulty
 * @returns {number} Index of best move
 */
function getBestMove() {
    const emptyCells = getEmptyCells(gameBoard);
    
    if (difficulty === 'easy') {
        // Easy: 70% random, 30% smart
        if (Math.random() < 0.7) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    } else if (difficulty === 'medium') {
        // Medium: 50% random, 50% smart
        if (Math.random() < 0.5) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }
    
    // Hard mode or smart move for easy/medium
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

/**
 * AI makes a move
 */
function aiMove() {
    if (!gameActive || gameMode !== 'ai') return;

    statusDisplay.textContent = 'AI is thinking...';
    statusDisplay.classList.add('thinking');
    
    // Add slight delay to make it feel more natural
    setTimeout(() => {
        const bestMove = getBestMove();
        const cell = cells[bestMove];
        
        updateCell(cell, bestMove);
        statusDisplay.classList.remove('thinking');
        checkResult();
    }, 500);
}

// ========================================
// GAME FUNCTIONS
// ========================================

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // In AI mode, only allow human moves when it's their turn
    if (gameMode === 'ai' && currentPlayer === AI) {
        return;
    }
    
    updateCell(clickedCell, clickedCellIndex);
    checkResult();

    // Trigger AI move if game is still active and in AI mode
    if (gameActive && gameMode === 'ai' && currentPlayer === AI) {
        aiMove();
    }
}

function updateCell(cell, index) {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.classList.add('disabled');
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    if (gameMode === 'ai') {
        statusDisplay.textContent = currentPlayer === HUMAN ? 'Your Turn' : "AI's Turn";
    } else {
        statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

function checkResult() {
    let roundWon = false;
    let winningCombination = [];
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }
    
    if (roundWon) {
        handleWin(winningCombination);
        return;
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
        if (currentPlayer === HUMAN) {
            statusDisplay.textContent = 'You Win! 🎉';
            statusDisplay.classList.add('win');
        } else {
            statusDisplay.textContent = 'AI Wins! 🤖';
            statusDisplay.classList.add('lose');
        }
    } else {
        statusDisplay.textContent = `Player ${currentPlayer} Wins! 🎉`;
        statusDisplay.classList.add('win');
    }
    
    winningCombination.forEach(index => {
        cells[index].classList.add('winner');
    });
    
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
    cells.forEach(cell => {
        cell.classList.add('disabled');
    });
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
    
    if (gameMode === 'ai') {
        statusDisplay.textContent = 'Your Turn';
    } else {
        statusDisplay.textContent = "Player X's Turn";
    }
    
    statusDisplay.classList.remove('win', 'draw', 'lose', 'thinking');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner', 'disabled');
    });
}

// ========================================
// MODE AND DIFFICULTY SELECTION
// ========================================

function setGameMode(mode) {
    gameMode = mode;
    
    // Update active button
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // Show/hide difficulty selection
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
    
    // Update active button
    difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === level) {
            btn.classList.add('active');
        }
    });

    resetGame();
}

// ========================================
// EVENT LISTENERS
// ========================================

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => setGameMode(btn.dataset.mode));
});

difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
});

// ========================================
// INITIALIZE GAME
// ========================================

statusDisplay.textContent = 'Your Turn';