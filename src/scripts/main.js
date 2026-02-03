'use strict';

const gameCell = document.querySelectorAll('.field-cell');
const button = document.querySelector('button');
const scoreInfo = document.querySelector('.game-score');
const messageStart = document.querySelector('.message-start');
const messageWin = document.querySelector('.message-win');
const messageLose = document.querySelector('.message-lose');
const message = document.querySelector('.message-container');

const number = document.querySelector('.game-score-number');
let score = 0;

const Game = require('../modules/Game');
const game = new Game();

// Animation after page has loaded
function loadPageNotification() {
  button.removeAttribute('disabled');
  messageStart.style.bottom = '40%';

  const startNotif = new Promise((resolve) => {
    window.addEventListener('load', () => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  });

  startNotif.then(() => {
    messageStart.style.opacity = '1';
    messageStart.style.transform = 'scale(1.3)';

    setTimeout(() => {
      const setPositionStartNotif = new Promise((resolve) => {
        resolve();
      });

      setPositionStartNotif
        .then(() => {
          messageStart.style.bottom = '0%';
          messageStart.style.transform = 'scale(1)';

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        })
        .then(() => {
          button.removeAttribute('disabled');
          button.style.animation = 'button-bloom 1s ease';
        });
    }, 1000);
  });
}

loadPageNotification();

// Function for identify each cell (Creation id such us '0-1' for each cell)
function createId() {
  let x = 0;
  let y = 0;

  gameCell.forEach((item) => {
    item.id = `${x}-${y}`;

    if (y < 3) {
      y++;
    } else {
      x++;
      y = 0;
    }
  });
}
createId();

// Event for button which can represent "Start" or "Restart"
button.addEventListener('click', (e) => {
  message.style.opacity = '0'; // Hide all messages under gameboard
  messageStart.style.opacity = '0';

  // Return location of all messages to initial state
  messageLose.style.bottom = '0%';
  messageWin.style.bottom = '0%';
  messageStart.style.bottom = '0%';

  // Hide all messages under gameboard
  messageLose.classList.add('hidden');
  messageWin.classList.add('hidden');

  // Screenplay for activation game and behavior for "Start" botton
  if (button.classList.contains('start')) {
    button.textContent = 'Restart';
    button.classList.remove('start');
    button.classList.add('restart');

    game.addNumber();
    game.addNumber();
    game.updateBoard();
    // Screenplay for behavior "Start" botton
  } else if (button.classList.contains('restart')) {
    game.getValues().forEach((cellItem) => {
      cellItem.valueNum = undefined;
    });

    game.updateBoard();

    button.textContent = 'Start';
    button.style.width = '100px';
    button.classList.remove('restart');
    button.classList.add('start');
    score = 0;
    scoreInfo.textContent = '0';
  }
});

// Creation rows from Game class
function createRows() {
  return game.board.reduce((boardRows, cell) => {
    if (!boardRows[cell.x]) {
      boardRows[cell.x] = [];
    }
    boardRows[cell.x].push(cell);

    return boardRows;
  }, []);
}

// Creation columns from Game class
function createColumns() {
  return game.board.reduce((boardColumns, cell) => {
    if (!boardColumns[cell.y]) {
      boardColumns[cell.y] = [];
    }
    boardColumns[cell.y].push(cell);

    return boardColumns;
  }, []);
}

function handleKeyUp(e) {
  const rows = createRows();
  const columns = createColumns();

  const prevBoard = game.getBoardValues();

  const moveTypes = {
    ArrowLeft: () => moveLeft(rows),
    ArrowRight: () => moveRight(rows),
    ArrowDown: () => moveDown(columns),
    ArrowUp: () => moveUp(columns),
  };

  const move = moveTypes[e.code];

  if (!move) {
    return;
  }

  const mergedNum = move();

  const currentBoard = game.getBoardValues();
  const boardChanged = prevBoard.some((val, i) => val !== currentBoard[i]);

  if (!boardChanged) {
    return;
  }

  if (mergedNum > 0) {
    score += mergedNum;
    setScore(); // Update Score in gameboard
  }

  game.addNumber();
  checkGameOver();
  game.updateBoard(); // Update HTML
}

document.addEventListener('keyup', handleKeyUp);

// Implementatiom moveup
function moveUp(columns) {
  let newScore = 0;

  columns.forEach((column) => {
    const cellVal = column
      .map((cellItem) => cellItem.valueNum)
      .filter((cellItem) => cellItem !== undefined);

    // iteration and check, are there duble numbers
    for (let i = 0; i < cellVal.length - 1; i++) {
      if (cellVal[i] === cellVal[i + 1]) {
        cellVal[i] *= 2; // if yes, duble number
        newScore += cellVal[i]; // increase score variable
        number.textContent = `+${cellVal[i]}`; // embed increasing number to 'number' variable, which represent animation over score
        cellVal.splice(i + 1, 1);
      }
    }

    // add objects for achiving initial column length
    while (cellVal.length < column.length) {
      cellVal.push(undefined);
    }

    // replace initials column values to new values
    for (let i = 0; i < column.length; i++) {
      column[i].valueNum = cellVal[i];
    }
  });

  return newScore;
}

function moveDown(columns) {
  let newScore = 0;

  columns.forEach((column) => {
    const cellVal = column
      .map((cellItem) => cellItem.valueNum)
      .filter((cellItem) => cellItem !== undefined);

    // iteration and check, are there duble numbers
    for (let i = cellVal.length - 1; i > 0; i--) {
      if (cellVal[i] === cellVal[i - 1]) {
        cellVal[i] *= 2; // if yes, duble number
        newScore += cellVal[i]; // increase score
        number.textContent = `+${cellVal[i]}`; // embed increasing number to 'number' variable, which represent animation over score
        cellVal.splice(i - 1, 1);
      }
    }

    while (cellVal.length < column.length) {
      cellVal.unshift(undefined);
    }

    for (let i = 0; i < column.length; i++) {
      column[i].valueNum = cellVal[i];
    }
  });

  return newScore;
}

function moveRight(rows) {
  let newScore = 0;

  rows.forEach((row) => {
    const cellVal = row
      .map((cellItem) => cellItem.valueNum)
      .filter((cellItem) => cellItem !== undefined);

    for (let i = cellVal.length - 1; i > 0; i--) {
      if (cellVal[i] === cellVal[i - 1]) {
        cellVal[i] *= 2;
        newScore += cellVal[i];
        number.textContent = `+${cellVal[i]}`;
        cellVal.splice(i - 1, 1);
      }
    }

    while (cellVal.length < row.length) {
      cellVal.unshift(undefined);
    }

    for (let i = 0; i < row.length; i++) {
      row[i].valueNum = cellVal[i];
    }
  });

  return newScore;
}

function moveLeft(rows) {
  let newScore = 0;

  rows.forEach((row) => {
    const cellVal = row
      .map((cellItem) => cellItem.valueNum)
      .filter((cellItem) => cellItem !== undefined);

    for (let i = 0; i < cellVal.length - 1; i++) {
      if (cellVal[i] === cellVal[i + 1]) {
        cellVal[i] *= 2;
        newScore += cellVal[i];
        number.textContent = `+${cellVal[i]}`;
        cellVal.splice(i + 1, 1);
      }
    }

    while (cellVal.length < row.length) {
      cellVal.push(undefined);
    }

    for (let i = 0; i < row.length; i++) {
      row[i].valueNum = cellVal[i];
    }
  });

  return newScore;
}

// Updation score and implementation victorious screenplay
function setScore() {
  scoreInfo.textContent = score; // Update HTML
  // set animation class for score
  number.classList.add('animation-number-slide');

  setTimeout(() => {
    number.classList.remove('animation-number-slide');
  }, 800);

  // implementation victorious screenplay

  const haveVictoriousNum = game.board.some((cell) => cell.valueNum >= 2048);

  if (haveVictoriousNum === true) {
    message.style.opacity = '1';
    messageWin.classList.remove('hidden');

    setTimeout(() => {
      messageWin.style.bottom = '40%';
      messageWin.style.transform = 'scale(1.3)';
    }, 1000);

    document.removeEventListener('keyup', handleKeyUp);
  }
}

// implementation losing screenplay
function checkGameOver() {
  if (game.isGameOver()) {
    message.style.opacity = '1';
    messageLose.classList.remove('hidden');
    messageLose.textContent = `You lose with ${score} score`;

    setTimeout(() => {
      messageLose.style.bottom = '40%';
      messageLose.style.transform = 'scale(1.3)';
    }, 1000);

    document.removeEventListener('keyup', handleKeyUp);
  }
}
