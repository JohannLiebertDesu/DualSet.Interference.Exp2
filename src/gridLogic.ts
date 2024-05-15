/**
 * Creates a grid for placing stimuli with specified columns and rows.
 * Marks the border and the middle column cells as occupied.
 * @return An array of GridCell objects.
 */

import { random } from "@coglabuzh/webpsy.js";

// Get the screen width and height, as well as number of rows and columns
export const screenWidth = window.screen.width;  // Get the screen width
export const screenHeight = window.screen.height;  // Get the screen height
export const numColumns = 11;  // Set the width of the grid
export const numRows = 6;  // Set the height of the grid

const ADJACENCY_LIMIT = 2; // Set the adjacency limit
const DIAGONAL_ADJACENCY = 1; // Set the diagonal adjacency


// Calculate the cell size based on the screen dimensions and grid size
export function calculateCellSize(screenWidth, screenHeight, numColumns, numRows) {
    const cellWidth = screenWidth / numColumns;
    const cellHeight = screenHeight / numRows;
    return {
        cellWidth,
        cellHeight
    };
}

// Define a type for the grid cells
export type GridCell = {
    id: string;
    occupied: boolean;
    x: number;
    y: number;
};

export function createGrid(numColumns: number, numRows: number): GridCell[] {
    const grid: GridCell[] = [];
    const middleColumnIndex = Math.floor(numColumns / 2); // Calculate the middle column index
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numColumns; col++) {
            // Check if the current cell is on the border or in the middle column
            const isBorder = col === 0 || col === numColumns - 1 || row === 0 || row === numRows - 1;
            const isMiddleColumn = col === middleColumnIndex;
            grid.push({
                id: `${col + 1}${String.fromCharCode(65 + row)}`, // Generates IDs like '1A', '2B', etc.
                occupied: isBorder || isMiddleColumn, // Mark as occupied if it's a border or middle column cell
                x: col,
                y: row
            });
        }
    }
    return grid;
}

export function selectAndOccupyCell(grid: GridCell[], side: 'left' | 'right' | 'both') {
    let availableCells = grid.filter(cell => !cell.occupied && (
        side === 'both' ||
        (side === 'left' && cell.x < numColumns / 2) ||
        (side === 'right' && cell.x >= numColumns / 2)
    ));
    console.log('Available cells for side:', side, availableCells);

    if (availableCells.length === 0) return null; // No available cells

    let selectedCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    console.log('Selected cell:', selectedCell);
    // Mark this cell and adjacent cells as occupied
    markAdjacentCellsAsOccupied(grid, selectedCell);
    return selectedCell;
}


export function markAdjacentCellsAsOccupied(grid: GridCell[], selectedCell: GridCell) {
    grid.forEach(cell => {
        // Check horizontal and vertical proximity (extend to two cells)
        if (
            (Math.abs(cell.x - selectedCell.x) <= ADJACENCY_LIMIT && cell.y === selectedCell.y) ||
            (Math.abs(cell.y - selectedCell.y) <= ADJACENCY_LIMIT && cell.x === selectedCell.x) ||
            // Check diagonal proximity (keep within one cell)
            (Math.abs(cell.x - selectedCell.x) === DIAGONAL_ADJACENCY && Math.abs(cell.y - selectedCell.y) === DIAGONAL_ADJACENCY)
        ) {
            cell.occupied = true;
        }
    });
    // Also mark the selected cell as occupied if not already done
    selectedCell.occupied = true;
}

export function resetGrid(grid: GridCell[], numColumns: number, numRows: number) {
    const middleColumnIndex = Math.floor(numColumns / 2);
    grid.forEach(cell => {
        const isBorder = cell.x === 0 || cell.x === numColumns - 1 || cell.y === 0 || cell.y === numRows - 1;
        const isMiddleColumn = cell.x === middleColumnIndex;
        cell.occupied = isBorder || isMiddleColumn;
    });
    console.log('Grid reset', grid);
}

export function randomColor() {
    // Generate random RGB values
    const r = random.randint(0, 256); // Random integer between 0 and 255
    const g = random.randint(0, 256); // Random integer between 0 and 255
    const b = random.randint(0, 256); // Random integer between 0 and 255
    return `rgb(${r}, ${g}, ${b})`;
}

export type Stimulus = {
    obj_type: 'circle';
    startX: number;
    startY: number;
    radius: number;
    line_color: string;
    fill_color: string;
    original_color: string;
};

export function generateCircles(grid: GridCell[], numCircles: number, cellWidth: number, cellHeight: number, side: 'left' | 'right' | 'both'): Stimulus[] {
    const stimuli: Stimulus[] = [];

    if (numCircles === 6 && side === 'both') {
        for (let i = 0; i < 3; i++) {
            let cell = selectAndOccupyCell(grid, 'left');
            if (cell) {
                const color = randomColor();
                stimuli.push({
                    obj_type: 'circle',
                    startX: cell.x * cellWidth + cellWidth / 2,
                    startY: cell.y * cellHeight + cellHeight / 2,
                    radius: Math.min(cellWidth, cellHeight) / 4,
                    line_color: color,
                    fill_color: color,
                    original_color: color // Save the original color
                });
            }
        }
        for (let i = 0; i < 3; i++) {
            let cell = selectAndOccupyCell(grid, 'right');
            if (cell) {
                const color = randomColor();
                stimuli.push({
                    obj_type: 'circle',
                    startX: cell.x * cellWidth + cellWidth / 2,
                    startY: cell.y * cellHeight + cellHeight / 2,
                    radius: Math.min(cellWidth, cellHeight) / 4,
                    line_color: color,
                    fill_color: color,
                    original_color: color // Save the original color
                });
            }
        }
    } else {
        for (let i = 0; i < numCircles; i++) {
            let cell = selectAndOccupyCell(grid, side);
            if (cell) {
                const color = randomColor();
                stimuli.push({
                    obj_type: 'circle',
                    startX: cell.x * cellWidth + cellWidth / 2,
                    startY: cell.y * cellHeight + cellHeight / 2,
                    radius: Math.min(cellWidth, cellHeight) / 4,
                    line_color: color,
                    fill_color: color,
                    original_color: color // Save the original color
                });
            }
        }
    }

    return stimuli;
}

export function selectRandomCircle(stimuli) {
    const randomIndex = random.randint(0, stimuli.length - 1);  // Adjusted to get a valid index
    const selectedStimulus = stimuli[randomIndex];
    const remainingStimuli = stimuli.filter((_, index) => index !== randomIndex);
    return { selectedStimulus, remainingStimuli };
}


