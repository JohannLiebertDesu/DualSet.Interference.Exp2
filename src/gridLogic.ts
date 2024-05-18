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
    // Generate a random hue value between 0 and 360
    const hue = Math.floor(Math.random() * 360);
    // Use fixed saturation and lightness values to match the color wheel
    const saturation = 80;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export type Stimulus = {
    obj_type: 'circle' | 'circle_with_line' | 'line';
    startX?: number;
    startY?: number;
    radius?: number;
    line_color?: string;
    fill_color?: string;
    original_color?: string;
    angle?: number; // Angle of the line
    line_length?: number; // Length of the line
    line_width?: number; // Width of the line
    x1?: number; // Start x-coordinate of the line
    y1?: number; // Start y-coordinate of the line
    x2?: number; // End x-coordinate of the line
    y2?: number; // End y-coordinate of the line
};


export function placeAndGenerateStimuli(grid: GridCell[], numCircles: number, cellWidth: number, cellHeight: number, side: 'left' | 'right' | 'both', stimulusType: 'circle' | 'circle_with_line'): Stimulus[] {
    const stimuli: Stimulus[] = [];

    if (numCircles === 6 && side === 'both') {
        for (let i = 0; i < 3; i++) {
            let cell = selectAndOccupyCell(grid, 'left');
            if (cell) {
                const newStimuli = createStimulus(cell, cellWidth, cellHeight, stimulusType);
                stimuli.push(...newStimuli);
            }
        }
        for (let i = 0; i < 3; i++) {
            let cell = selectAndOccupyCell(grid, 'right');
            if (cell) {
                const newStimuli = createStimulus(cell, cellWidth, cellHeight, stimulusType);
                stimuli.push(...newStimuli);
            }
        }
    } else {
        for (let i = 0; i < numCircles; i++) {
            let cell = selectAndOccupyCell(grid, side);
            if (cell) {
                const newStimuli = createStimulus(cell, cellWidth, cellHeight, stimulusType);
                stimuli.push(...newStimuli);
            }
        }
    }

    return stimuli;
}

function createStimulus(cell: GridCell, cellWidth: number, cellHeight: number, stimulusType: 'circle' | 'circle_with_line'): Stimulus[] {
    const color = randomColor();
    const stimuli: Stimulus[] = [];

    const centerX = cell.x * cellWidth + cellWidth / 2;
    const centerY = cell.y * cellHeight + cellHeight / 2;
    const radius = Math.min(cellWidth, cellHeight) / 4;

    if (stimulusType === 'circle') {
        stimuli.push({
            obj_type: 'circle',
            startX: centerX,
            startY: centerY,
            radius: radius,
            line_color: color,
            fill_color: color,
            original_color: color // Save the original color
        });
    } else if (stimulusType === 'circle_with_line') {
        const angle = Math.random() * 2 * Math.PI; // Random angle in radians
        const line_length = radius; // Line length is equal to the radius
        const line_width = 2; // Define line width as needed

        const endX = centerX + line_length * Math.cos(angle);
        const endY = centerY + line_length * Math.sin(angle);

        stimuli.push({
            obj_type: 'circle',
            startX: centerX,
            startY: centerY,
            radius: radius,
            line_color: 'black',
            fill_color: 'transparent', // No fill for circle_with_line
            original_color: 'transparent'
        });
        stimuli.push({
            obj_type: 'line',
            x1: centerX,
            y1: centerY,
            x2: endX,
            y2: endY,
            line_color: 'black',
            line_width: line_width
        });
    }

    return stimuli;
}



export function selectRandomCircle(stimuli) {
    const randomIndex = random.randint(0, stimuli.length - 1);  // Adjusted to get a valid index
    const selectedStimulus = stimuli[randomIndex];
    const remainingStimuli = stimuli.filter((_, index) => index !== randomIndex);
    return { selectedStimulus, remainingStimuli };
}


