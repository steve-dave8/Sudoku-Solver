const boardInput = document.getElementById("sudoku-challenge-board");

// Generate blank Sudoku grid for inputs:
const blankSudokuGrid = [];

for (let reg = 1; reg < 10; reg++) {
  let rowStart, rowEnd, colStart, colEnd;

  if ([1, 2, 3].includes(reg)) {
    rowStart = 1;
    rowEnd = 3;
  } 
  else if ([4, 5, 6].includes(reg)) {
    rowStart = 4;
    rowEnd = 6;
  } 
  else if ([7, 8, 9].includes(reg)) {
    rowStart = 7;
    rowEnd = 9;
  }

  if ([1, 4, 7].includes(reg)) {
    colStart = 1;
    colEnd = 3;
  } 
  else if ([2, 5, 8].includes(reg)) {
    colStart = 4;
    colEnd = 6;
  } 
  else if ([3, 6, 9].includes(reg)) {
    colStart = 7;
    colEnd = 9;
  }

  const sudokuRegion = [];

  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      const cell = new SudokuCell(row, col, reg);
      sudokuRegion.push(cell);
    }
  }

  blankSudokuGrid.push(sudokuRegion);
}

boardInput.innerHTML = blankSudokuGrid.map(region =>
  `<div class="sudoku-region">
    ${region.map((cell) =>
      `<div class="flex-center">
        <input class="cell-test" type="number" min="1" max="9" step="1" data-row="${cell.row}" data-column="${cell.column}" data-region="${cell.region}" oninput="quickValidation(event)" />
      </div>`)
    .join("")}
  </div>`)
.join("");