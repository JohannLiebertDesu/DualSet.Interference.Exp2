import { varSystem, expInfo } from "./settings"; // import the variables from settings

// Define a few variables
const screenWidth = window.screen.width; // Get the screen width
const screenHeight = window.screen.height; // Get the screen height

const numColumns = 11; // Set the width of the grid
const numRows = 6; // Set the height of the grid

// Calculate the cell size based on the screen dimensions and grid size
function calculateCellSize(screenWidth, screenHeight, numColumns, numRows) {
    const cellWidth = screenWidth / numColumns;
    const cellHeight = screenHeight / numRows;
    return {
        cellWidth,
        cellHeight
    };
}

// Define a type for the grid cells
type GridCell = {
    id: string;
    occupied: boolean;
    x: number;
    y: number;
};

// Create a grid structure to place stimuli
function createGrid(numColumns: number, numRows: number): GridCell[] {
    const grid: GridCell[] = []; // Explicitly define the array type
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numColumns; col++) {
            grid.push({
                id: `${col + 1}${String.fromCharCode(65 + row)}`, // Generates IDs like '1A', '2B', etc.
                occupied: false,
                x: col,
                y: row
            });
        }
    }
    return grid;
}

function selectAndOccupyCell(grid: GridCell[]) {
    let availableCells = grid.filter(cell => !cell.occupied);
    if (availableCells.length === 0) return null; // No available cells

    let selectedCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    // Mark this cell and adjacent cells as occupied
    markAdjacentCellsAsOccupied(grid, selectedCell);
    return selectedCell;
}

function markAdjacentCellsAsOccupied(grid: GridCell[], selectedCell: GridCell) {
    grid.forEach(cell => {
        // Check horizontal and vertical proximity (extend to two cells)
        if (
            (Math.abs(cell.x - selectedCell.x) <= 2 && cell.y === selectedCell.y) ||
            (Math.abs(cell.y - selectedCell.y) <= 2 && cell.x === selectedCell.x) ||
            // Check diagonal proximity (keep within one cell)
            (Math.abs(cell.x - selectedCell.x) === 1 && Math.abs(cell.y - selectedCell.y) === 1)
        ) {
            cell.occupied = true;
        }
    });
    // Also mark the selected cell as occupied if not already done
    selectedCell.occupied = true;
}


