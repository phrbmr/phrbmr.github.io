let gameBoard = [];

function initGame() {
    for (let i = 0; i < 4; i++) {
        gameBoard[i] = [0, 0, 0, 0];
    }
    generateTile();
    generateTile();
    renderBoard();
}

function generateTile() {
    let added = false;
    while (!added) {
        let row = Math.floor(Math.random() * 4);
        let col = Math.floor(Math.random() * 4);
        if (gameBoard[row][col] === 0) {
            gameBoard[row][col] = Math.random() > 0.5 ? 2 : 4;
            added = true;
        }
    }
}

function renderBoard() {
    const gridContainer = document.querySelector('.grid');
    gridContainer.innerHTML = '';  // Clear the grid container

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'grid-cell';
            if (gameBoard[i][j] !== 0) {
                tile.innerText = gameBoard[i][j];
                tile.className += ' value-' + gameBoard[i][j]; // For additional styling
            }
            gridContainer.appendChild(tile);
        }
    }
}

function moveLeft() {
    let moved = false;
    for (let i = 0; i < 4; i++) {
        let row = gameBoard[i];
        let originalRow = [...row];
        let newRow = row.filter(val => val);
        while (newRow.length < 4) {
            newRow.push(0);
        }
        for (let j = 0; j < 3; j++) {
            if (newRow[j] === newRow[j + 1]) {
                newRow[j] *= 2;
                newRow.splice(j + 1, 1);
                newRow.push(0);
            }
        }
        gameBoard[i] = newRow;
        if (originalRow.join('') !== newRow.join('')) {
            moved = true;
        }
    }
    return moved;
}


function moveRight() {
    let moved = false;
    for (let i = 0; i < 4; i++) {
        let row = gameBoard[i];
        let originalRow = [...row];
        let newRow = row.filter(val => val);
        while (newRow.length < 4) {
            newRow.unshift(0);
        }
        for (let j = 3; j > 0; j--) {
            if (newRow[j] === newRow[j - 1]) {
                newRow[j] *= 2;
                newRow.splice(j - 1, 1);
                newRow.unshift(0);
            }
        }
        gameBoard[i] = newRow;
        if (originalRow.join('') !== newRow.join('')) {
            moved = true;
        }
    }
    return moved;
}


function moveUp() {
    let moved = false;
    for (let j = 0; j < 4; j++) {
        let column = [gameBoard[0][j], gameBoard[1][j], gameBoard[2][j], gameBoard[3][j]];
        let originalColumn = [...column];
        let newColumn = column.filter(val => val);
        while (newColumn.length < 4) {
            newColumn.push(0);
        }
        for (let i = 0; i < 3; i++) {
            if (newColumn[i] === newColumn[i + 1]) {
                newColumn[i] *= 2;
                newColumn.splice(i + 1, 1);
                newColumn.push(0);
            }
        }
        for (let i = 0; i < 4; i++) {
            gameBoard[i][j] = newColumn[i];
        }
        if (originalColumn.join('') !== newColumn.join('')) {
            moved = true;
        }
    }
    return moved;
}


function moveDown() {
    let moved = false;
    for (let j = 0; j < 4; j++) {
        let column = [gameBoard[0][j], gameBoard[1][j], gameBoard[2][j], gameBoard[3][j]];
        let originalColumn = [...column];
        let newColumn = column.filter(val => val);
        while (newColumn.length < 4) {
            newColumn.unshift(0);
        }
        for (let i = 3; i > 0; i--) {
            if (newColumn[i] === newColumn[i - 1]) {
                newColumn[i] *= 2;
                newColumn.splice(i - 1, 1);
                newColumn.unshift(0);
            }
        }
        for (let i = 0; i < 4; i++) {
            gameBoard[i][j] = newColumn[i];
        }
        if (originalColumn.join('') !== newColumn.join('')) {
            moved = true;
        }
    }
    return moved;
}

function checkWinCondition() {
    for (let i = 0; i < 4; i++) {
        if (gameBoard[i].includes(2048)) {
            alert("Congratulations! You won!");
            // Further actions for winning can be added here
            break;
        }
    }
}

function checkGameOver() {
    if (!hasEmptySpace() && !canCombine()) {
        alert("Game Over!");
        // Further actions for game over can be added here
    }
}

function hasEmptySpace() {
    return gameBoard.some(row => row.some(cell => cell === 0));
}

function canCombine() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i < 3 && gameBoard[i][j] === gameBoard[i + 1][j]) {
                return true;
            }
            if (j < 3 && gameBoard[i][j] === gameBoard[i][j + 1]) {
                return true;
            }
        }
    }
    return false;
}

document.addEventListener('keydown', function(event) {
    let moved = false;
    switch (event.key) {
        case 'ArrowUp':
            moved = moveUp();
            break;
        case 'ArrowDown':
            moved = moveDown();
            break;
        case 'ArrowLeft':
            moved = moveLeft();
            break;
        case 'ArrowRight':
            moved = moveRight();
            break;
    }
    if (moved) {
        generateTile();
        renderBoard();
        checkGameOver();
        checkWinCondition();
    }
});



document.addEventListener('DOMContentLoaded', initGame);
