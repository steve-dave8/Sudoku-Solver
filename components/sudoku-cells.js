let isExtremeSudoku = false;

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

  removePossibleNumber(number) {
    const index = this.possibleNumbers.findIndex(x => x == number);
    if (index !== -1) {
      this.possibleNumbers.splice(index, 1);
    }
  };
}