// Purpose: Define the stimuli used in the experiment

import { random } from "@coglabuzh/webpsy.js";

// Interface to define the structure of a stimulus object
interface Stimulus {
  type: "dot" | "clock"; // Type of the stimulus: either "dot" or "clock"
  color?: string; // Optional color property for dot stimuli
  orientation?: number; // Optional orientation property for clock stimuli
}

// Function to generate an array of stimuli based on the condition and item type
export const generateStims = function (condition: number, itemType: "dot" | "clock"): Stimulus[] {
  const stim_array: Stimulus[] = []; // Initialize an empty array to store the stimuli

  // Loop to generate the specified number of stimuli based on the condition
  for (let i = 0; i < condition; i++) {
    if (itemType === "dot") {
      // If the item type is "dot", generate a random RGB color
      const color = `rgb(${random.randint(0, 255)}, ${random.randint(0, 255)}, ${random.randint(0, 255)})`;
      stim_array.push({ type: "dot", color }); // Add a dot stimulus with the generated color to the array
    } else {
      // If the item type is "clock", generate a random orientation between 0 and 359 degrees
      const orientation = random.randint(0, 359);
      stim_array.push({ type: "clock", orientation }); // Add a clock stimulus with the generated orientation to the array
    }
  }

  return stim_array; // Return the array of generated stimuli
};