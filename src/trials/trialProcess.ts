import psychophysics from "@kurokida/jspsych-psychophysics";
import { generateStims } from "./stimuli";
import { random } from "@coglabuzh/webpsy.js";

function randomChoice<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export function createNewTrial(condition: number, itemType: "dot" | "clock"): any[] {
  const trial_line: any[] = [];

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  const gridWidth = 13;
  const gridHeight = 7;
  const cellWidth = screenWidth / gridWidth;
  const cellHeight = screenHeight / gridHeight;
  const stim_array = generateStims(condition, itemType);

  const usedPositions: number[][] = [];

  stim_array.forEach((stimulus) => {
    let x, y;
    const firstSide = randomChoice(["left", "right"]);
    let currentSide = firstSide;
    let switchCount = 0;
  
    do {
      const side = currentSide;
      const gridXRange = side === "left" ? [1, Math.floor(gridWidth / 2) - 1] : [Math.floor(gridWidth / 2) + 1, gridWidth - 2];
      const gridX = random.randint(gridXRange[0], gridXRange[1]);
      const gridY = random.randint(1, gridHeight - 2);
      x = gridX * cellWidth + cellWidth / 2;
      y = gridY * cellHeight + cellHeight / 2;
  
      if (condition > 4) {
        switchCount++;
        if (switchCount >= 4) {
          currentSide = currentSide === "left" ? "right" : "left";
          switchCount = 0;
        }
      }
    } while (usedPositions.some(pos => {
      const dx = Math.abs(pos[0] - x);
      const dy = Math.abs(pos[1] - y);
      const cellDistance = Math.sqrt(Math.pow(dx / cellWidth, 2) + Math.pow(dy / cellHeight, 2));
      return (dx === 0 && dy <= 2 * cellHeight) || (dy === 0 && dx <= 2 * cellWidth) || (dx > 0 && dy > 0 && cellDistance <= Math.sqrt(2));
    }));
  
    usedPositions.push([x, y]);
  
    const size = Math.min(cellWidth, cellHeight) * 0.8; // 80% of the cell size
  
    if (stimulus.type === "dot") {
      trial_line.push({
        obj_type: "circle",
        startX: x,
        startY: y,
        radius: size / 2,
        fill_color: stimulus.color,
        show_start_time: 0,
      });
    } else {
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
  
  return trial_line;
}


