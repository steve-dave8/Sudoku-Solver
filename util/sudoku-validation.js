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
  let errorList = [];
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

  Array.from(inputs).forEach(input => {
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
      const regIndex = regions.findIndex(region => region.id == input.dataset.region);
      regions[regIndex].values.push(value);
      const rowIndex = rows.findIndex(row => row.id == input.dataset.row);
      rows[rowIndex].values.push(value);
      const colIndex = columns.findIndex(column => column.id == input.dataset.column);
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

  const validateArea = (areas, type) => {
    for (const area of areas) {
      if (
        area.values.length > 1 
        && area.values.some((value, index) => index !== area.values.lastIndexOf(value))
      ) {
        errorList.push(`number appears multiple times in a ${type}`);
        break;
      }
    }
  }
  validateArea(regions, "region");
  validateArea(rows, "row");
  validateArea(columns, "column");

  if (isExtremeSudoku) {
    if (
      (backslashDiagVals.length > 1 && backslashDiagVals.some((value, index) => index !== backslashDiagVals.lastIndexOf(value))) 
      || (forwardslashDiagVals.length > 1 && forwardslashDiagVals.some((value, index) => index !== forwardslashDiagVals.lastIndexOf(value)))
    ) {
      errorList.push("number appears multiple times in a diagonal (which is not allowed in Sudoku-X)");
    }
  }

  return errorList;
};