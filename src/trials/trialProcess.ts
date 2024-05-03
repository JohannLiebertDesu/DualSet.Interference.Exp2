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

  const gridWidth = 17;
  const gridHeight = 8;
  const cellWidth = screenWidth / gridWidth;
  const cellHeight = screenHeight / gridHeight;
  const stim_array = generateStims(condition, itemType);

  const usedPositions: number[][] = [];

  stim_array.forEach((stimulus) => {
    let x, y;
    do {
      const side = condition <= 4 ? randomChoice(["left", "right"]) : condition <= 6 ? (usedPositions.length < condition - 2 ? "left" : "right") : usedPositions.length < 4 ? "left" : "right";
      const gridX = side === "left" ? random.randint(0, 7) : random.randint(9, 16);
      const gridY = random.randint(0, 7);
      x = gridX * cellWidth + cellWidth / 2;
      y = gridY * cellHeight + cellHeight / 2;
    } while (usedPositions.some(pos => Math.abs(pos[0] - x) + Math.abs(pos[1] - y) < 4 * cellWidth));

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
