let errorList = [];
let isExtremeSudoku = false;

const boardInput = document.getElementById("sudoku-challenge-board");
const errorListElement = document.getElementById("error-list");
const formErrors = document.getElementById("form-errors");
const solutionSection = document.getElementById("solution-section");
const sudokuSolutionGrid = document.getElementById("sudoku-solution-board");
const partialSolutionText = document.getElementById("partial-solution-txt");

const possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const backslashDiagCoords = ["1-1", "2-2", "3-3", "4-4", "5-5", "6-6", "7-7", "8-8", "9-9"];
const forwardslashDiagCoords = ["9-1", "8-2", "7-3", "6-4", "5-5", "4-6", "3-7", "2-8", "1-9"];

class SudokuCell {
  constructor(row, col, region) {
    this.row = row;
    this.column = col;
    this.region = region;
  }
}

class SudokuCellSolution extends SudokuCell {
  constructor(row, col, region, value = null) {
    super(row, col, region);
    this.value = value;
    this.given = value ? true : false;
    this.possibleNumbers = this.given ? [] : [...possibleNumbers];
    if (isExtremeSudoku) {
      this.onBackslashDiag = backslashDiagCoords.includes(`${row}-${col}`);
      this.onForwardslashDiag = forwardslashDiagCoords.includes(`${row}-${col}`);
    }
  }

  removePossibleNumber = (number) => {
    const index = this.possibleNumbers.findIndex(x => x == number);
    if (index !== -1) {
      this.possibleNumbers.splice(index, 1);
    }
  };
}

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

boardInput.innerHTML = blankSudokuGrid.map((region) =>
  `<div class="sudoku-region">
    ${region.map((cell) =>
      `<div class="flex-center">
        <input class="cell-test" type="number" min="1" max="9" step="1" data-row="${cell.row}" data-column="${cell.column}" data-region="${cell.region}" oninput="quickValidation(event)" />
      </div>`)
    .join("")}
  </div>`)
.join("");
// --------------------

const clearSudokuForm = () => {
  Array.from(boardInput.elements).forEach((input) => {
    if (input.type === "number") input.value = "";
  });
};

const quickValidation = (e) => {
  const value = e.target.value;
  const intValue = parseInt(value, 10);
  if (
    e.target.validity.badInput 
    || isNaN(value) 
    || intValue < 1 
    || intValue > 9 
    || e.target.validity.stepMismatch 
    || (!isNaN(intValue) && intValue - parseFloat(value) !== 0)
  ) {
    e.target.classList.add("cell-error");
  } 
  else {
    e.target.classList.remove("cell-error");
  }
};

const validateSudokuInput = (inputs) => {
  errorList = [];
  let regions = [];
  let rows = [];
  let columns = [];
  let backslashDiagVals = [];
  let forwardslashDiagVals = [];

  for (let i = 1; i <= 9; i++) {
    regions.push({ id: i, values: [] });
    rows.push({ id: i, values: [] });
    columns.push({ id: i, values: [] });
  }

  let givensCount = 0;

  Array.from(inputs).forEach((input) => {
    let error;
    const value = parseInt(input.value, 10);

    if (input.validity.badInput || isNaN(input.value)) {
      error = "non-numeric input";
    } 
    else if (value < 1 || value > 9) {
      error = "number outside of acceptable range of 1 to 9";
    } 
    else if (input.validity.stepMismatch || (!isNaN(value) && value - parseFloat(input.value) !== 0)) {
      error = "number which is not an integer";
    } 
    else if (input.value.trim() !== "") {
      const regIndex = regions.findIndex((region) => region.id == input.dataset.region);
      regions[regIndex].values.push(value);
      const rowIndex = rows.findIndex((row) => row.id == input.dataset.row);
      rows[rowIndex].values.push(value);
      const colIndex = columns.findIndex((column) => column.id == input.dataset.column);
      columns[colIndex].values.push(value);
      givensCount++;

      if (isExtremeSudoku) {
        const coord = `${input.dataset.row}-${input.dataset.column}`;
        if (backslashDiagCoords.includes(coord)) backslashDiagVals.push(value);
        if (forwardslashDiagCoords.includes(coord)) forwardslashDiagVals.push(value);
      }
    }

    if (error && !errorList.includes(error)) errorList.push(error);
  });

  if (givensCount < 17) {
    errorList.push(`a Sudoku grid must have at least 17 given numbers to produce a unique solution. Received ${givensCount} valid numbers.`);
  }

  for (const region of regions) {
    if (
      region.values.length > 1 
      && region.values.some((value, index) => index !== region.values.lastIndexOf(value))
    ) {
      errorList.push("number appears multiple times in a region");
      break;
    }
  }
  for (const row of rows) {
    if (
      row.values.length > 1 &&
      row.values.some((value, index) => index !== row.values.lastIndexOf(value))
    ) {
      errorList.push("number appears multiple times in a row");
      break;
    }
  }
  for (const column of columns) {
    if (
      column.values.length > 1 &&
      column.values.some((value, index) => index !== column.values.lastIndexOf(value))
    ) {
      errorList.push("number appears multiple times in a column");
      break;
    }
  }

  if (isExtremeSudoku) {
    if (
      (backslashDiagVals.length > 1 && backslashDiagVals.some((value, index) => index !== backslashDiagVals.lastIndexOf(value))) 
      || (forwardslashDiagVals.length > 1 && forwardslashDiagVals.some((value, index) => index !== forwardslashDiagVals.lastIndexOf(value)))
    ) {
      errorList.push("number appears multiple times in a diagonal (which is not allowed in Sudoku-X)");
    }
  }
};

const handleSubmission = () => {
  isExtremeSudoku = document.querySelector("input[name='extreme-sudoku']:checked").value === "yes";

  validateSudokuInput(boardInput.elements);

  if (errorList.length) {
    errorListElement.innerHTML = errorList.map((error) => `<li>${error}</li>`).join("");
    formErrors.classList.remove("nodisplay");
    sudokuSolutionGrid.innerHTML = "";
    solutionSection.classList.add("nodisplay");
    window.scrollTo({top: document.documentElement.scrollHeight, behavior: "smooth"});
  } 
  else {
    errorListElement.innerHTML = "";
    formErrors.classList.add("nodisplay");
    const sudokuBoard = [];
    let fullSolution = true; // assume there will be a complete solution
    Array.from(boardInput.elements).forEach((input) => {
      if (input.type === "number") { // exclude submit button from inputs
        const value = parseInt(input.value, 10) || null;
        const sudokuCell = new SudokuCellSolution(input.dataset.row, input.dataset.column, input.dataset.region, value);
        sudokuBoard.push(sudokuCell);
      }
    });

    const assignCellValue = (index, value) => {
      sudokuBoard[index].value = value;
      sudokuBoard[index].possibleNumbers = [];
    };

    const narrowPossibilities = (chosenCell, defValue) => {
      sudokuBoard.forEach((cell) => {
        if (
          cell.region == chosenCell.region 
          || cell.row == chosenCell.row 
          || cell.column == chosenCell.column
        ) {
          cell.removePossibleNumber(defValue);
        }
        if (isExtremeSudoku) {
          if (
            (cell.onBackslashDiag && chosenCell.onBackslashDiag) 
            || (cell.onForwardslashDiag && chosenCell.onForwardslashDiag)
          ) {
            cell.removePossibleNumber(defValue);
          }
        }
      });
    };

    // Scan given numbers first:
    const givens = sudokuBoard.filter((cell) => cell.given);
    givens.forEach((given) => {
      narrowPossibilities(given, given.value);
    });

    while (sudokuBoard.some(cell => !cell.value)) {
      // Solving Method 1 - check for a cell with only one possible number:
      const index = sudokuBoard.findIndex(cell => cell.possibleNumbers.length === 1);
      if (index !== -1) {
        const chosenCell = sudokuBoard[index];
        const defValue = sudokuBoard[index].possibleNumbers[0];
        assignCellValue(index, defValue);
        narrowPossibilities(chosenCell, defValue);
      }
      else {
        // Solving Method 2 - search for cells with a lone number:
        /* (explanation: if among a cell's possible numbers one possibility only occurs once 
        in that region's cells then it must belong to that cell. Similarly for cells in a row/column.) */
        let hasLoneNumber = false;

        const findLoneNumberByArea = (areas) => {
          for (let i = 0; i < areas.length; i++) {
            let subscripts = {}; // subscript marking possible values for cells in a given region/row/column and counting their occurrences
            areas[i].cells.forEach(cell => {
              cell.possibleNumbers.forEach(num => {
                if (!subscripts.hasOwnProperty(num)) {
                  subscripts[num] = 0;
                }
                subscripts[num] += 1;
              });
            });
            for (const num in subscripts) {
              if (subscripts[num] == 1) {
                const defValue = parseInt(num, 10);
                const areasCell = areas[i].cells.find(cell => cell.possibleNumbers.includes(defValue));
                const index = sudokuBoard.findIndex(cell => cell.row == areasCell.row && cell.column == areasCell.column);
                const chosenCell = sudokuBoard[index];
                assignCellValue(index, defValue);
                narrowPossibilities(chosenCell, defValue);
                hasLoneNumber = true;
              }
            }
            if (hasLoneNumber) break; // skip iterating over the rest of the areas because the Sudoku board has changed
          }
        }

        let regions = [];
        for (let i = 1; i <= 9; i++) {
          let regionCells = sudokuBoard.filter(cell => !cell.value && cell.region == i); // exclude solved cells
          if (regionCells.length) regions.push({ id: i, cells: [...regionCells] }); // skip regions that are fully solved
        }
        findLoneNumberByArea(regions);

        if (!hasLoneNumber) {
          let rows = [];
          for (let i = 1; i <= 9; i++) {
            let rowCells = sudokuBoard.filter(cell => !cell.value && cell.row == i);
            if (rowCells.length) rows.push({ id: i, cells: [...rowCells] });
          }
          findLoneNumberByArea(rows);
        }

        if (!hasLoneNumber) {
          let columns = [];
          for (let i = 1; i <= 9; i++) {
            let columnCells = sudokuBoard.filter(cell => !cell.value && cell.column == i);
            if (columnCells.length) columns.push({ id: i, cells: [...columnCells] });
          }
          findLoneNumberByArea(columns);
        }

        if (!hasLoneNumber) {
          // Solving Method 3 - pair exclusion:
          /* (explanation: if two cells in a region each have only two possible numbers that are the same
          values then those values cannot appear in any other cells in that region. If those pairs occur in the
          same row/column then they cannot appear in any other region of that row/column.) */
          let hasPair = false;
          let exclusions = 0;

          for (let i = 0; i < regions.length; i++) {
            if (regions[i].cells.every(cell => cell.possibleNumbers.length === 2)) {
              continue;
            }
            let possiblePairs = [];
            regions[i].cells.forEach(cell => {
              if (cell.possibleNumbers.length === 2) possiblePairs.push(cell);
            });

            let pairs = [];
            for (let j = 0; j < possiblePairs.length - 1; j++) {
              for (let k = j + 1; k < possiblePairs.length; k++) {
                if (possiblePairs[j].possibleNumbers.every((num, index) => num === possiblePairs[k].possibleNumbers[index])) {
                  const pair = {
                    values: [...possiblePairs[j].possibleNumbers],
                    region: possiblePairs[j].region,
                    sharedRow: possiblePairs[j].row === possiblePairs[k].row && possiblePairs[j].row,
                    sharedColumn: possiblePairs[j].column === possiblePairs[k].column && possiblePairs[j].column
                  }
                  pairs.push(pair);
                  hasPair = true;
                }
              }
            }

            pairs.forEach(pair => {
              sudokuBoard.forEach((cell, index) => {
                if (!cell.value) {
                  let exclude = false;
                  if (cell.region === pair.region) {
                    if (!(
                      cell.possibleNumbers.length === pair.values.length 
                      && cell.possibleNumbers.every((num, index) => num === pair.values[index])
                    )) {
                      exclude = true;
                    }
                  }
                  else if (pair.sharedRow === cell.row || pair.sharedColumn === cell.column) {
                    exclude = true;
                  }

                  if (exclude) {
                    const len1 = cell.possibleNumbers.length;
                    pair.values.forEach(value => {
                      cell.removePossibleNumber(value);
                    });
                    const len2 = sudokuBoard[index].possibleNumbers.length;
                    exclusions += len1 - len2;
                  }
                }
              });
            });
          }

          if (!hasPair || !exclusions) {
            // Solving Method 4: row/column exclusion:
            /* (explanation: if among a region's cells' possible numbers one possibility only appears in a single
            row/column then that number cannot appear in any other region of that row/column.) */
            let rcExclusions = 0;

            for (let i = 0; i < regions.length; i++) {
              // Get unassigned numbers for a region and note which rows and columns they could possibily belong to:
              const availableNums = [];
              regions[i].cells.forEach(cell => {
                cell.possibleNumbers.forEach(num => {
                  let anIndex = availableNums.findIndex(an => an.value === num);
                  if (anIndex === -1) {
                    const availableNum = {
                      value: num,
                      rows: [cell.row],
                      columns: [cell.column]
                    }
                    availableNums.push(availableNum);
                  }
                  else {
                    const {rows, columns} = availableNums[anIndex];
                    if (!rows.includes(cell.row)) availableNums[anIndex].rows.push(cell.row);
                    if (!columns.includes(cell.column)) availableNums[anIndex].columns.push(cell.column);
                  }
                });
              });

              availableNums.forEach(an => {
                if (an.rows.length === 1) {
                  sudokuBoard.forEach(cell => {
                    if (!cell.value && cell.region != regions[i].id) {
                      if (cell.row === an.rows[0] && cell.possibleNumbers.includes(an.value)) {
                        cell.removePossibleNumber(an.value);
                        rcExclusions++;
                      }
                    }
                  });
                }
                else if (an.columns.length === 1) {
                  sudokuBoard.forEach(cell => {
                    if (!cell.value && cell.region != regions[i].id) {
                      if (cell.column === an.columns[0] && cell.possibleNumbers.includes(an.value)) {
                        cell.removePossibleNumber(an.value);
                        rcExclusions++;
                      }
                    }
                  });
                }
              });
            }

            // TODO: find alternate solving methods.
            if (!rcExclusions) {
              fullSolution = false;
              console.log("Error: unable to solve.");
              break;
            }
          }
        }
      }
    }

    const solutionBoard = [];
    for (let reg = 1; reg < 10; reg++) {
      const sudokuRegion = sudokuBoard.filter((cell) => cell.region == reg);
      solutionBoard.push(sudokuRegion);
    }

    sudokuSolutionGrid.innerHTML = solutionBoard.map((region) =>
      `<div class="sudoku-region">
        ${region.map((cell) =>
          `<div class="flex-center ${cell.given ? "" : "gold-text"}">
            ${cell.value 
              ? `<span class="cell-value">${cell.value}</span>`
              : `<span class="cell-value possibilities">${cell.possibleNumbers.join()}</span>`
            }
          </div>`)
        .join("")}
      </div>`)
    .join("");

    partialSolutionText.innerHTML = fullSolution ? "" : "Partial ";
    solutionSection.classList.remove("nodisplay");

    window.scrollTo({top: document.documentElement.scrollHeight, behavior: "smooth"});
  }
};