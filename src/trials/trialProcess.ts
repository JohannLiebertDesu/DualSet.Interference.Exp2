import psychophysics from "@kurokida/jspsych-psychophysics";
import { generateStims } from "./stimuli";
import { random } from "@coglabuzh/webpsy.js";

// Function to randomly select an element from an array
function randomChoice<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Function to create a new trial with the specified condition and item type
export function createNewTrial(condition: number, itemType: "dot" | "clock"): any[] {
  const trial_line: any[] = []; // Initialize an empty array to store the trial objects

  const screenWidth = window.screen.width; // Get the screen width
  const screenHeight = window.screen.height; // Get the screen height

  const gridWidth = 11; // Set the width of the grid
  const gridHeight = 6; // Set the height of the grid
  const cellWidth = screenWidth / gridWidth; // Calculate the width of each cell in the grid
  const cellHeight = screenHeight / gridHeight; // Calculate the height of each cell in the grid
  const stim_array = generateStims(condition, itemType); // Generate the stimuli array based on the condition and item type

  const usedPositions: number[][] = []; // Initialize an empty array to store the used positions

  // Iterate over each stimulus in the stimuli array
  stim_array.forEach((stimulus) => {
    let x, y; // Declare variables to store the x and y coordinates of the stimulus
    const firstSide = randomChoice(["left", "right"]); // Randomly select the initial side
    let currentSide = firstSide; // Set the current side to the initial side
    let switchCount = 0; // Initialize a counter for side switches
  
    do {
      const side = currentSide; // Get the current side
      // Determine the range of grid X coordinates based on the current side
      const gridXRange = side === "left" ? [1, Math.floor(gridWidth / 2) - 1] : [Math.floor(gridWidth / 2) + 1, gridWidth - 2];
      const gridX = random.randint(gridXRange[0], gridXRange[1]); // Generate a random grid X coordinate within the range
      const gridY = random.randint(1, gridHeight - 2); // Generate a random grid Y coordinate within the range
      x = gridX * cellWidth + cellWidth / 2; // Calculate the x coordinate of the stimulus
      y = gridY * cellHeight + cellHeight / 2; // Calculate the y coordinate of the stimulus
  
      if (condition > 3) {
        switchCount++; // Increment the switch count
        if (switchCount >= 3) {
          currentSide = currentSide === "left" ? "right" : "left"; // Switch the side if the switch count reaches 3
          switchCount = 0; // Reset the switch count
        }
      }
    } while (usedPositions.some(pos => {
      const dx = Math.abs(pos[0] - x); // Calculate the absolute difference in x coordinates
      const dy = Math.abs(pos[1] - y); // Calculate the absolute difference in y coordinates
      const cellDistance = Math.sqrt(Math.pow(dx / cellWidth, 2) + Math.pow(dy / cellHeight, 2)); // Calculate the distance in terms of cells
      // Check if the current position is too close to any used position
      return (dx === 0 && dy <= 2 * cellHeight) || (dy === 0 && dx <= 2 * cellWidth) || (dx > 0 && dy > 0 && cellDistance <= Math.sqrt(2));
    }));
  
    usedPositions.push([x, y]); // Add the current position to the used positions array
  
    const size = Math.min(cellWidth, cellHeight) * 0.8; // Calculate the size of the stimulus (80% of the cell size)
  
    if (stimulus.type === "dot") {
      // If the stimulus type is "dot", create a circle object and add it to the trial line
      trial_line.push({
        obj_type: "circle",
        startX: x,
        startY: y,
        radius: size / 2,
        fill_color: stimulus.color,
        show_start_time: 0,
      });
    } else {
      // If the stimulus type is "clock", create a circle and a line object and add them to the trial line
      trial_line.push({
        obj_type: "circle",
        startX: x,
        startY: y,
        radius: size / 2,
        line_color: "black",
        fill_color: "white",
        show_start_time: 0,
      });
      trial_line.push({
        obj_type: "line",
        startX: x,
        startY: y,
        endX: x + size * Math.cos((stimulus.orientation * Math.PI) / 180),
        endY: y + size * Math.sin((stimulus.orientation * Math.PI) / 180),
        line_width: 2,
        show_start_time: 0,
      });
    }
  });
  
  return trial_line; // Return the array of trial objects
}


