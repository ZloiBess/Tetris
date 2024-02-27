"use strict";

const PLAYFIELD_COLUMN = 10;
const PLAYFIELD_ROWS = 20;
let SPEED_AUTO_MOVE_DOUNW = 300;
const TETROMINO_NAMES_FORMS = new Map();
let tetromino = null;
let fieldCells = null;
let idInterval = null;
let score = 10;

{
  TETROMINO_NAMES_FORMS.set("A", [
    [0, 1, 1],
    [1, 1, 0],
  ]);

  TETROMINO_NAMES_FORMS.set("B", [
    [1, 0, 0],
    [1, 1, 1],
  ]);

  TETROMINO_NAMES_FORMS.set("C", [[1, 1, 1, 1]]);

  TETROMINO_NAMES_FORMS.set("D", [
    [1, 1],
    [1, 1],
  ]);

  TETROMINO_NAMES_FORMS.set("E", [[1, 1, 1], [0, 1, 0]]);

  TETROMINO_NAMES_FORMS.set("F", [
    [1, 1, 0],
    [0, 1, 1]
  ])
}

/**
 * Starter>-----------------------------------------------------
 */

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.querySelector(".menu").style.display = "none";
    run();
  }
});

function run() {
  deletePlayField();
  clearInterval(idInterval);

  fieldCells = generatePlayFIeld();
  tetromino = generateRandomTetromino();
  score = 0;
  drawTetromino();
  autoActionGame();
}
//_____________________________________________________________/

/**
 * Generate the playing field and get arr cells.
 * @returns arr ceels playing fiels
 */
function generatePlayFIeld() {
  let field = document.querySelector(".grid");
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMN; i++) {
    const div = document.createElement("div");
    field.append(div);
  }
  field.style.gridTemplateColumns = `repeat(${PLAYFIELD_COLUMN}, auto)`;
  return document.querySelectorAll(".grid div");
}

function deletePlayField() {
  if (fieldCells !== null) {
    for (let e of fieldCells) {
      e.remove();
    }
  }
}

/**
 * Move the tetromino using the keyboard arrows.
 * Clrear tetromino -> Calculate new coordinate -> Draw tetromino.
 */

document.addEventListener("keydown", function (e) {
  userControlTetromino(e);
});

function userControlTetromino(e) {
  clearTetromino();
  switch (e.key) {
    case "ArrowUp":
      tetromino.rotate();
      break;
    case "ArrowDown":
      if (checkCollidedTetrominoBottom()) {
        drawTetromino();
        tetromino = generateRandomTetromino();
      } else {
        shiftTetromino(1, 0);
      }
      break;
    case "ArrowLeft":
      checkCollidedTetrominoLeftRight();
      if (!tetromino.collideLeft) {
        shiftTetromino(0, -1);
      }
      break;
    case "ArrowRight":
      checkCollidedTetrominoLeftRight();
      if (!tetromino.collideRight) {
        shiftTetromino(0, 1);
      }
      break;
  }
  checkAndRemoveAllFullRowsPlayingField();
  drawTetromino();
}

function autoActionGame() {
  idInterval = setInterval(() => {
    clearTetromino();
    if (checkCollidedTetrominoBottom()) {
      drawTetromino();
      tetromino = generateRandomTetromino();
      //lose
      if (checkCollidedTetrominoBottom()) {
        clearPlayingField();
        clearTetromino();
        clearInterval(idInterval);
        let menu = document.querySelector(".menu");
        menu.style.display = "flex";
        menu.querySelector("h1").innerHTML = `Score: ${score}`;
        return;
      }
    } else {
      shiftTetromino(1, 0);
    }
    checkAndRemoveAllFullRowsPlayingField();
    drawTetromino();
    
  }, SPEED_AUTO_MOVE_DOUNW);
}

function shiftTetromino(shiftY, shiftX) {
  for (let row = 0; row < tetromino.coordinate.length; row++) {
    for (let col = 0; col < tetromino.coordinate[0].length; col++) {
      let cell = tetromino.coordinate[row][col];
      if (cell === -1) continue;
      let newCell = cell + shiftX + shiftY * PLAYFIELD_COLUMN;
      tetromino.coordinate[row][col] = newCell;
    }
  }
}

function drawTetromino() {
  for (let row = 0; row < tetromino.coordinate.length; row++) {
    for (let col = 0; col < tetromino.coordinate[0].length; col++) {
      let cell = tetromino.coordinate[row][col];
      if (cell === -1) continue;
      fieldCells[cell].classList.add(tetromino.name);
    }
  }
}

function clearTetromino() {
  for (let row = 0; row < tetromino.coordinate.length; row++) {
    for (let col = 0; col < tetromino.coordinate[0].length; col++) {
      let cell = tetromino.coordinate[row][col];
      if (cell === -1) continue;
      fieldCells[cell].removeAttribute("class");
    }
  }
}

function checkCollidedTetrominoBottom() {
  let startCellBottomRowPlayingField =
    PLAYFIELD_COLUMN * PLAYFIELD_ROWS - PLAYFIELD_COLUMN;
  let endCellBottomRowPlayingField = PLAYFIELD_COLUMN * PLAYFIELD_ROWS - 1;
  let arr = tetromino.coordinate;
  for (let col = 0; col < arr[0].length; col++) {
    for (let row = 0; row < arr.length; row++) {
      let cell = arr[row][col];
      if (cell === -1) continue;
      if (
        startCellBottomRowPlayingField <= cell &&
        endCellBottomRowPlayingField >= cell
      )
        return true;
      let bottomOfCell = cell + PLAYFIELD_COLUMN;
      if (fieldCells[bottomOfCell].classList.length > 0) return true;
    }
  }
  return false;
}

function checkCollidedTetrominoLeftRight() {
  let arr = tetromino.coordinate;
  tetromino.collideLeft = false;
  tetromino.collideRight = false;
  for (let col = 0; col < arr[0].length; col++) {
    for (let row = 0; row < arr.length; row++) {
      let cell = arr[row][col];
      if (cell === -1) continue;
      isCollidedWalls(cell);
      isCollidedAnotherTetromino(cell);
    }
  }
}

function isCollidedAnotherTetromino(cell) {
  let leftOfCell = cell - 1;
  let rightOfCell = cell + 1;
  if (rightOfCell === PLAYFIELD_COLUMN * PLAYFIELD_ROWS) return;
  if (fieldCells[leftOfCell].classList.length > 0) {
    tetromino.collideLeft = true;
  }
  if (fieldCells[rightOfCell].classList.length > 0) {
    tetromino.collideRight = true;
  }
}

function isCollidedWalls(cell) {
  if (cell % PLAYFIELD_COLUMN === PLAYFIELD_COLUMN - 1) {
    tetromino.collideRight = true;
  }
  if (cell % PLAYFIELD_COLUMN === 0) {
    tetromino.collideLeft = true;
  }
}

function checkAndRemoveAllFullRowsPlayingField() {
  let countCell = 0;
  let countColumn = 0;
  let endCellRow = 0;
  for (let cell = 0; cell < fieldCells.length; cell++) {
    if (countColumn === PLAYFIELD_COLUMN) {
      countCell = 0;
      countColumn = 0;
    }
    countColumn++;

    let element = fieldCells[cell];
    if (element.classList.length > 0) {
      countCell++;
    } else {
      countCell = 0;
    }

    if (countCell === PLAYFIELD_COLUMN) {
      endCellRow = cell;
      break;
    }
  }
  //not have full row
  if (endCellRow === 0) return;

  //remove row
  let startCellRow = endCellRow - PLAYFIELD_COLUMN + 1;
  for (let cell = startCellRow; cell <= endCellRow; cell++) {
    fieldCells[cell].removeAttribute("class");
  }
  //shift down all row
  for (let cell = startCellRow - 1; cell >= 0; cell--) {
    let element = fieldCells[cell];
    if (element.classList.length > 0) {
      let nameClass = element.classList[0];
      element.removeAttribute("class");
      fieldCells[cell + PLAYFIELD_COLUMN].classList.add(nameClass);
    }
  }
  score += PLAYFIELD_COLUMN;
  document.querySelector(".score").innerHTML = `Score: ${score}`;
  checkAndRemoveAllFullRowsPlayingField();
}

function clearPlayingField() {
  if (fieldCells === null) return;
  for (let l of fieldCells) {
    l.removeAttribute("class");
  }
}

/**
 * Get the key letter starting from A and
 * then pull the tetromino shape from the map and
 * create a tetromino object from above in the center of the playing field.
 * @returns Object random tetromino from map.
 */
function generateRandomTetromino() {
  let random = String.fromCharCode(
    Math.ceil(Math.random() * TETROMINO_NAMES_FORMS.size + "A".charCodeAt()) - 1
  );
  let middleField = Math.trunc(PLAYFIELD_COLUMN / 2);
  let coordinateTetro = deepCopy(TETROMINO_NAMES_FORMS.get(random));
  let middleTetro = Math.trunc(coordinateTetro[0].length / 2);
  //Position top center of field;
  let countRow = 0;
  for (let row = 0; row < coordinateTetro.length; row++) {
    let countColumn = 0;
    for (let column = 0; column < coordinateTetro[0].length; column++) {
      let cell = coordinateTetro[row][column];
      if (cell === 0) {
        coordinateTetro[row][column] = -1;
        countColumn++;
        continue;
      }
      coordinateTetro[row][column] =
        middleField - middleTetro + countColumn + countRow * PLAYFIELD_COLUMN;
      countColumn++;
    }
    countRow++;
  }

  //assit
  function getFirstCellCoordinate(row) {
    for (let i = 0; i < row.length; i++) {
      let cell = row[i];
      if (cell === -1) continue;
      return (cell = cell - i);
    }
  }
  //assist
  function deepCopy(array) {
    const copy = [];
    for (const element of array) {
      if (Array.isArray(element)) {
        copy.push(deepCopy(element));
      } else {
        copy.push(element);
      }
    }
    return copy;
  }

  //Method for object
  function rotate() {
    let res = [];
    let saveCellTopLeft = getFirstCellCoordinate(this.coordinate[0]);
    //rotate form tetromino.
    for (let i = 0; i < this.coordinate[0].length; i++) {
      let sub = [];
      for (let k = this.coordinate.length - 1; k >= 0; k--) {
        let cell = this.coordinate[k][i];
        sub.push(cell);
      }
      res.push(sub);
    }
    //Calculate new coordinates of an already rotated form.
    let newCollidedRight = false;
    let countRow = 0;
    for (let row = 0; row < res.length; row++) {
      let countColumn = 0;
      for (let col = 0; col < res[0].length; col++) {
        let cell = res[row][col];
        if (cell === -1) {
          countColumn++;
          continue;
        } else {
          let newCell = saveCellTopLeft + countColumn + PLAYFIELD_COLUMN * row;
          if (newCell % PLAYFIELD_COLUMN === PLAYFIELD_COLUMN - 1) {
            newCollidedRight = true;
          }
          res[row][col] = newCell;
          countColumn++;
        }
      }
      countRow++;
    }
    //check tetromina breaks on two lines after rotate;
    let startNewCell = saveCellTopLeft;
    let endNewCell = startNewCell + res[0].length - 1;
    if (endNewCell % PLAYFIELD_COLUMN < startNewCell % PLAYFIELD_COLUMN) return;

    //check collided or going beyond
    for (let row of res) {
      for (let col of row) {
        if (col === -1) continue;
        let element = fieldCells[col];
        if (element === undefined) return;
        if (element.classList.length > 0) return;
      }
    }
    this.coordinate = res;
    this.collideRight = newCollidedRight;
  }

  return {
    name: random,
    coordinate: coordinateTetro,
    collideLeft: false,
    collideRight: false,
    rotate,
  };
}
