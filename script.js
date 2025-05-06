// Sudoku Solver class handles the puzzle generation and solving logic
class SudokuSolver {
    static solveSudoku(grid) {
        const emptyCell = SudokuSolver.findEmptyCell(grid);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;

        for (let num = 1; num <= 9; num++) {
            if (SudokuSolver.isValid(grid, row, col, num)) {
                grid[row][col] = num;

                if (SudokuSolver.solveSudoku(grid)) {
                    return true;
                }

                grid[row][col] = 0;
            }
        }

        return false;
    }

    static findEmptyCell(grid) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    // Master validation function that checks all three Sudoku rules
    static isValid(grid, row, col, num) {
        return SudokuSolver.isValidRow(grid, row, num) &&
               SudokuSolver.isValidColumn(grid, col, num) &&
               SudokuSolver.isValidBox(grid, row, col, num);
    }

    // RULE 3: Each row must contain numbers 1-9, without repetition
    static isValidRow(grid, row, num) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === num) return false;
        }
        return true;
    }

    // RULE 4: Each column must contain numbers 1-9, without repetition
    static isValidColumn(grid, col, num) {
        for (let row = 0; row < 9; row++) {
            if (grid[row][col] === num) return false;
        }
        return true;
    }

    // RULE 5: Each 3x3 block must contain numbers 1-9, without repetition
    static isValidBox(grid, row, col, num) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        return true;
    }

    // Helper function to get sum of a box (should be 45 for a complete valid box)
    static getBoxSum(grid, row, col) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                sum += grid[boxRow + i][boxCol + j];
            }
        }
        return sum;
    }

    // Helper function to get sum of a row (should be 45 for a complete valid row)
    static getRowSum(grid, row) {
        return grid[row].reduce((sum, num) => sum + num, 0);
    }

    // Helper function to get sum of a column (should be 45 for a complete valid column)
    static getColumnSum(grid, col) {
        return grid.reduce((sum, row) => sum + row[col], 0);
    }
}

// GridManager class handles the visual representation of the grid
class GridManager {
    constructor() {
        this.gridElement = document.getElementById('sudokuGrid');
        this.selectedCell = null;
        
        // Create error message element
        this.errorMessage = document.createElement('div');
        this.errorMessage.className = 'error-message';
        this.gridElement.parentElement.appendChild(this.errorMessage);
        
        // Create success message element
        this.successMessage = document.createElement('div');
        this.successMessage.className = 'success-message';
        this.gridElement.parentElement.appendChild(this.successMessage);
        
        this.numberPadPopup = document.getElementById('numberPadPopup');
        this.numberPadBtns = Array.from(this.numberPadPopup.querySelectorAll('.number-pad-btn'));
        this.popupCallback = null;
        this.addNumberPadListeners();
    }

    addNumberPadListeners() {
        this.numberPadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.popupCallback) {
                    this.popupCallback(btn.textContent);
                }
                this.hideNumberPad();
            });
        });
        // Hide popup on outside click
        document.addEventListener('mousedown', (e) => {
            if (!this.numberPadPopup.contains(e.target) && !this.gridElement.contains(e.target)) {
                this.hideNumberPad();
            }
        });
    }

    showNumberPad(cell, callback) {
        this.popupCallback = callback;
        const rect = cell.getBoundingClientRect();
        const containerRect = this.gridElement.parentElement.getBoundingClientRect();
        this.numberPadPopup.style.display = 'grid';
        this.numberPadPopup.style.left = (rect.left - containerRect.left + rect.width / 2 - 70) + 'px';
        this.numberPadPopup.style.top = (rect.top - containerRect.top + rect.height + 5) + 'px';
    }

    hideNumberPad() {
        this.numberPadPopup.style.display = 'none';
        this.popupCallback = null;
    }

    createGrid() {
        this.gridElement.innerHTML = '';

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = Math.floor(i / 9);
            cell.dataset.col = i % 9;
            this.gridElement.appendChild(cell);
        }
    }

    updateGridDisplay(grid) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = grid[row][col];
            
            cell.textContent = value === 0 ? '' : value;
            cell.className = 'cell';
            
            if (value !== 0) {
                cell.classList.add('fixed');
            }
        });
    }

    selectCell(cell) {
        if (cell.classList.contains('fixed')) return;

        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        this.selectedCell = cell;
        cell.classList.add('selected');
    }

    updateCell(row, col, value) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.textContent = value === 0 ? '' : value;
            cell.classList.toggle('input', value !== 0);
            cell.classList.remove('invalid');
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }

    markInvalid(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('invalid');
        }
    }

    clearInvalid(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.remove('invalid');
        }
    }

    markSuccess() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.add('success');
        });
        
        // Add the complete class to the grid to fix the black bar issue
        this.gridElement.classList.add('complete');
        
        // Set explicit width to prevent any extra space
        const gridWidth = 9 * 3.125; // 9 cells at 3.125em each
        this.gridElement.style.width = gridWidth + 'em';
        this.gridElement.style.borderRight = 'none';
    }

    showSuccess(message) {
        // Hide any error messages
        this.hideError();
        
        // Show success message
        this.successMessage.textContent = message;
        this.successMessage.classList.add('show');
        
        // Add success class to grid
        // this.gridElement.classList.add('success');
        this.markSuccess();
    }

    hideSuccess() {
        this.successMessage.classList.remove('show');
        this.gridElement.classList.remove('success');
    }

}

// GameManager class handles the game logic and state
class GameManager {
    constructor() {
        // RULE 1 & 2: Create a 9x9 grid for numbers 1-9
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.gridManager = new GridManager();
        this.invalidCells = new Set(); // Track invalid cells
        this.initializeGame();
    }

    initializeGame() {
        this.gridManager.createGrid();
        this.generatePuzzle();
        this.addEventListeners();
    }

    generatePuzzle() {
        // Generate a solved puzzle
        SudokuSolver.solveSudoku(this.solution);
        
        // Copy solution to grid and remove some numbers
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }

        // Remove numbers to create the puzzle
        let cellsToRemove = 40; // Adjust difficulty by changing this number
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                cellsToRemove--;
            }
        }

        this.gridManager.updateGridDisplay(this.grid);
    }

    addEventListeners() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(cell, e));
        });

        document.getElementById('newGame').addEventListener('click', () => this.generatePuzzle());
    }

    handleCellClick(cell, e) {
        if (cell.classList.contains('fixed')) return;
        
        this.gridManager.selectCell(cell);
        
        this.gridManager.showNumberPad(cell, (value) => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellKey = `${row},${col}`;
            
            if (value === 'X') {
                // Delete the number
                this.grid[row][col] = 0;
                this.gridManager.updateCell(row, col, 0);
                this.gridManager.clearInvalid(row, col);
                this.invalidCells.delete(cellKey);
                
                // Re-check all conflicts after deletion
                this.checkAllConflicts();
            } else {
                // Input a number
                const num = parseInt(value);
                
                // Clear previous invalid state for this cell
                this.gridManager.clearInvalid(row, col);
                this.invalidCells.delete(cellKey);
                
                // Update grid with new number
                this.grid[row][col] = num;
                this.gridManager.updateCell(row, col, num);
                
                // Check if the move violates any rules
                const conflicts = this.findConflicts(row, col, num);
                
                if (conflicts.length > 0) {
                    // Invalid move - mark this cell
                    this.invalidCells.add(cellKey);
                    this.gridManager.markInvalid(row, col);
                    
                    // Also mark all conflicting cells
                    conflicts.forEach(conflict => {
                        const [conflictRow, conflictCol] = conflict;
                        const conflictKey = `${conflictRow},${conflictCol}`;
                        this.invalidCells.add(conflictKey);
                        this.gridManager.markInvalid(conflictRow, conflictCol);
                    });
                    
                    // Create more specific error message
                    let errorMessage = '';
                    const sameRow = conflicts.some(([r, c]) => r === row);
                    const sameCol = conflicts.some(([r, c]) => c === col);
                    const sameBox = conflicts.some(([r, c]) => 
                        Math.floor(r/3) === Math.floor(row/3) && 
                        Math.floor(c/3) === Math.floor(col/3));
                    
                    if (sameRow) {
                        errorMessage = `Number ${num} already exists in this row!`;
                    } else if (sameCol) {
                        errorMessage = `Number ${num} already exists in this column!`;
                    } else if (sameBox) {
                        errorMessage = `Number ${num} already exists in this 3x3 box!`;
                    } else {
                        errorMessage = 'This number violates Sudoku rules!';
                    }
                    
                    this.gridManager.showError(errorMessage);
                } else {
                    // Check if all errors are fixed
                    this.checkAllConflicts();
                    
                    // Check if the puzzle is complete
                    this.checkForCompletion();
                }
            }
        });
    }

    handleKeyPress(e) {
        // Disable keyboard input for numbers, only allow navigation if needed
        // (Optional: you can remove this method if you want to fully rely on the popup)
    }

    isValidMove(row, col, num) {
        // Check row
        for (let i = 0; i < 9; i++) {
            if (i !== col && this.grid[row][i] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.grid[i][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = boxRow + i;
                const currentCol = boxCol + j;
                if (currentRow !== row && currentCol !== col && 
                    this.grid[currentRow][currentCol] === num) return false;
            }
        }

        return true;
    }

    // Find all cells that conflict with the current move
    findConflicts(row, col, num) {
        const conflicts = [];
        
        // Check row conflicts
        for (let c = 0; c < 9; c++) {
            if (c !== col && this.grid[row][c] === num) {
                conflicts.push([row, c]);
            }
        }
        
        // Check column conflicts
        for (let r = 0; r < 9; r++) {
            if (r !== row && this.grid[r][col] === num) {
                conflicts.push([r, col]);
            }
        }
        
        // Check box conflicts
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const currentRow = boxRow + r;
                const currentCol = boxCol + c;
                if ((currentRow !== row || currentCol !== col) && 
                    this.grid[currentRow][currentCol] === num) {
                    conflicts.push([currentRow, currentCol]);
                }
            }
        }
        
        return conflicts;
    }

    // Check all cells in the grid for conflicts and update their visual state
    checkAllConflicts() {
        // First clear any existing invalid markings
        const invalidCellsArray = Array.from(this.invalidCells);
        invalidCellsArray.forEach(cellKey => {
            const [row, col] = cellKey.split(',').map(Number);
            this.gridManager.clearInvalid(row, col);
        });
        this.invalidCells.clear();
        
        let hasConflicts = false;
        let errorType = '';
        let conflictValue = 0;
        
        // Check each non-empty cell for conflicts with other cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = this.grid[row][col];
                if (num !== 0) {
                    const conflicts = this.findConflicts(row, col, num);
                    if (conflicts.length > 0) {
                        hasConflicts = true;
                        conflictValue = num;
                        
                        // Determine conflict type for error message
                        const sameRow = conflicts.some(([r, c]) => r === row);
                        const sameCol = conflicts.some(([r, c]) => c === col);
                        const sameBox = conflicts.some(([r, c]) => 
                            Math.floor(r/3) === Math.floor(row/3) && 
                            Math.floor(c/3) === Math.floor(col/3));
                        
                        if (sameRow) errorType = 'row';
                        else if (sameCol) errorType = 'column';
                        else if (sameBox) errorType = 'box';
                        
                        // Mark this cell
                        const cellKey = `${row},${col}`;
                        this.invalidCells.add(cellKey);
                        this.gridManager.markInvalid(row, col);
                        
                        // Mark conflicting cells
                        conflicts.forEach(conflict => {
                            const [conflictRow, conflictCol] = conflict;
                            const conflictKey = `${conflictRow},${conflictCol}`;
                            this.invalidCells.add(conflictKey);
                            this.gridManager.markInvalid(conflictRow, conflictCol);
                        });
                    }
                }
            }
        }
        
        // Update error message state with specific information
        if (hasConflicts) {
            let errorMessage = '';
            if (errorType === 'row') {
                errorMessage = `Number ${conflictValue} appears multiple times in the same row!`;
            } else if (errorType === 'column') {
                errorMessage = `Number ${conflictValue} appears multiple times in the same column!`;
            } else if (errorType === 'box') {
                errorMessage = `Number ${conflictValue} appears multiple times in the same 3x3 box!`;
            } else {
                errorMessage = 'Fix the highlighted conflicts to proceed.';
            }
            this.gridManager.showError(errorMessage);
        } else {
            this.gridManager.hideError();
        }
    }

    // Update error message state based on current invalid cells
    updateErrorState() {
        if (this.invalidCells.size === 0) {
            this.gridManager.hideError();
        }
    }



    // Check if the puzzle is complete (all cells filled and no conflicts)
    checkForCompletion() {
        // Only check if there are no conflicts
        if (this.invalidCells.size > 0) {
            return;
        }
        
        // Check if all cells are filled
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    return; // Puzzle is incomplete
                }
            }
        }
        
        // If we reach here, all cells are filled and there are no conflicts
        // Verify that all Sudoku rules are satisfied
        this.verifyFullSolution();
    }
    
    // Verify that a complete grid satisfies all Sudoku rules
    verifyFullSolution() {
        // Check all rows, columns, and boxes have sum of 45
        // and contain all numbers 1-9
        
        // Check rows
        for (let i = 0; i < 9; i++) {
            const rowSum = SudokuSolver.getRowSum(this.grid, i);
            if (rowSum !== 45) {
                return;
            }
            
            // Verify no duplicates in row
            const rowDigits = new Set();
            for (let j = 0; j < 9; j++) {
                rowDigits.add(this.grid[i][j]);
            }
            if (rowDigits.size !== 9) {
                return;
            }
        }
        
        // Check columns
        for (let j = 0; j < 9; j++) {
            const colSum = SudokuSolver.getColumnSum(this.grid, j);
            if (colSum !== 45) {
                return;
            }
            
            // Verify no duplicates in column
            const colDigits = new Set();
            for (let i = 0; i < 9; i++) {
                colDigits.add(this.grid[i][j]);
            }
            if (colDigits.size !== 9) {
                return;
            }
        }
        
        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 9; boxRow += 3) {
            for (let boxCol = 0; boxCol < 9; boxCol += 3) {
                const boxSum = SudokuSolver.getBoxSum(this.grid, boxRow, boxCol);
                if (boxSum !== 45) {
                    return;
                }
                
                // Verify no duplicates in box
                const boxDigits = new Set();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        boxDigits.add(this.grid[boxRow + i][boxCol + j]);
                    }
                }
                if (boxDigits.size !== 9) {
                    return;
                }
            }
        }
        
        // All checks passed - solution is correct!
        this.gridManager.markSuccess();
        this.gridManager.showSuccess('Congratulations! You solved the Sudoku puzzle correctly!');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new GameManager();
});
