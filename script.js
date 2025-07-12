// Minesweeper Game JavaScript

class MinesweeperGame {
    constructor() {
        this.board = [];
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.flaggedCount = 0;
        
        this.gameBoard = document.getElementById('game-board');
        this.mineCount = document.getElementById('mine-count');
        this.timerDisplay = document.getElementById('timer');
        this.gameMessage = document.getElementById('game-message');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.createBoard();
        this.renderBoard();
        this.updateMineCount();
        this.resetTimer();
        this.gameMessage.textContent = '';
        this.gameMessage.className = 'game-message';
        this.resetBtn.textContent = '🙂';
    }
    
    createBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first click or if already has mine
            if ((row === firstRow && col === firstCol) || this.board[row][col].isMine) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            minesPlaced++;
        }
        
        this.calculateNeighborMines();
    }
    
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    if (this.board[newRow][newCol].isMine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));
                
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    handleCellClick(event) {
        if (this.gameOver || this.gameWon) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isFlagged || cell.isRevealed) return;
        
        // First click - place mines
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealCell(row, col);
        this.updateDisplay();
        this.checkWinCondition();
    }
    
    handleRightClick(event) {
        event.preventDefault();
        if (this.gameOver || this.gameWon) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        this.flaggedCount += cell.isFlagged ? 1 : -1;
        
        this.updateDisplay();
        this.updateMineCount();
    }
    
    revealCell(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        
        if (cell.isMine) {
            this.gameOver = true;
            this.endGame(false);
            return;
        }
        
        // Auto-reveal adjacent cells if no neighboring mines
        if (cell.neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
    
    updateDisplay() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                
                cellElement.className = 'cell';
                cellElement.textContent = '';
                
                if (cell.isFlagged) {
                    cellElement.classList.add('flagged');
                } else if (cell.isRevealed) {
                    cellElement.classList.add('revealed');
                    
                    if (cell.isMine) {
                        cellElement.classList.add('mine');
                    } else if (cell.neighborMines > 0) {
                        cellElement.textContent = cell.neighborMines;
                        cellElement.classList.add(`number-${cell.neighborMines}`);
                    }
                }
            }
        }
    }
    
    checkWinCondition() {
        let revealedCells = 0;
        let totalSafeCells = this.rows * this.cols - this.mines;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isRevealed && !this.board[row][col].isMine) {
                    revealedCells++;
                }
            }
        }
        
        if (revealedCells === totalSafeCells) {
            this.gameWon = true;
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.stopTimer();
        
        if (won) {
            this.gameMessage.textContent = '🎉 You Won! 🎉';
            this.gameMessage.className = 'game-message win';
            this.resetBtn.textContent = '😎';
        } else {
            this.gameMessage.textContent = '💥 Game Over! 💥';
            this.gameMessage.className = 'game-message lose';
            this.resetBtn.textContent = '😵';
            
            // Reveal all mines
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[row][col].isMine) {
                        this.board[row][col].isRevealed = true;
                    }
                }
            }
            this.updateDisplay();
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.timerDisplay.textContent = '0';
    }
    
    updateMineCount() {
        const remainingMines = this.mines - this.flaggedCount;
        this.mineCount.textContent = remainingMines;
    }
    
    setDifficulty(difficulty) {
        this.stopTimer();
        
        switch (difficulty) {
            case 'easy':
                this.rows = 9;
                this.cols = 9;
                this.mines = 10;
                break;
            case 'medium':
                this.rows = 16;
                this.cols = 16;
                this.mines = 40;
                break;
            case 'hard':
                this.rows = 16;
                this.cols = 30;
                this.mines = 99;
                break;
        }
        
        this.resetGame();
    }
    
    resetGame() {
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.flaggedCount = 0;
        this.initializeGame();
    }
}

// Global variables and functions
let game;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game = new MinesweeperGame();
});

// Global functions for HTML onclick events
function resetGame() {
    game.resetGame();
}

function setDifficulty(difficulty) {
    game.setDifficulty(difficulty);
}

// Prevent context menu on game board
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.game-board')) {
        e.preventDefault();
    }
});
