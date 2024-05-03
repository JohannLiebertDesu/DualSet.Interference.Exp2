// Purpose: Define the stimuli used in the experiment

import { random } from "@coglabuzh/webpsy.js";

interface Stimulus {
  type: "dot" | "clock";
  color?: string;
  orientation?: number;
}

export const generateStims = function (condition: number, itemType: "dot" | "clock"): Stimulus[] {
  const stim_array: Stimulus[] = [];

  for (let i = 0; i < condition; i++) {
    if (itemType === "dot") {
      const color = `rgb(${random.randint(0, 255)}, ${random.randint(0, 255)}, ${random.randint(0, 255)})`;
      stim_array.push({ type: "dot", color });
    } else {
      const orientation = random.randint(0, 359);
      stim_array.push({ type: "clock", orientation });
    }
  }

  return stim_array;
};