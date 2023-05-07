const clearSudokuForm = () => {
  Array.from(boardInput.elements).forEach(input => {
    if (input.type === "number") {
      input.value = "";
      input.classList.remove("cell-error");
    } 
  });
};