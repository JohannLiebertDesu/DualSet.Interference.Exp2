/**
 * @title DualSet.Interference.Exp1
 * @description Systematically varying the combination possibilities and numbers of 2 sets that need to be memorized, including color patches and orientations. Variations include screen side, mixing or separating the qualitatively different items. Each trial concludes with the reproduction of 2 items.
 * @author Chenyu Li and Noah Rischert
 * @version 0.2.1
 *
 *
 * @assets assets/
 */

// import stylesheets (.scss or .css).
import "../styles/main.scss";

// jsPsych official plugin
import preload from "@jspsych/plugin-preload";
import psychophysics from "@kurokida/jspsych-psychophysics";

// Global variables
import { jsPsych } from "./jsp";
import { expInfo } from "./settings";
import { random } from "@coglabuzh/webpsy.js";

// screens
import { welcome_screen } from "./instructions/welcome";
import { consent_screen, notice_screen } from "./instructions/consent";
import { browser_screen } from "./instructions/browserCheck";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, numColumns, numRows, createGrid, resetGrid, calculateCellSize, generateCircles, Stimulus } from "./gridLogic";



/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  // Initialize a timeline to hold the trials
  var timeline: any[] = [];

  // Preload assets
  const preload_screen = {
    type: preload,
    images: assetPaths.images,
    // audio: assetPaths.audio,
    // video: assetPaths.video,
  };

  /************************************** Instruction **************************************/

  /************************************** Practice **************************************/

  /************************************** Experiment **************************************/

  // Calculate the grid cell size and create the grid
  const grid = createGrid(numColumns, numRows);
  const { cellWidth, cellHeight } = calculateCellSize(screenWidth, screenHeight, numColumns, numRows);
  

  var trial = {
    type: psychophysics,
    stimuli: function(): Stimulus[] {
        return generateCircles(grid, jsPsych.timelineVariable('numCircles'), cellWidth, cellHeight);
    },
    choices: "NO_KEYS",
    background_color: '#008000',
    trial_duration: 1000,
    post_trial_gap: 2000,
    timeline_variables: [
        { numCircles: 3 },
        { numCircles: 6 }
    ],
    on_finish: function(data) {
        // Reset grid after each trial
        resetGrid(grid, numColumns, numRows);

        // Example: return data about the trial, e.g., how many cells were occupied at the end
        let occupiedCount = grid.filter(cell => cell.occupied).length;
        return {occupiedCount: occupiedCount}; // Appends this data to the trial's data
    },
    sample: {
        type: 'with-replacement',
        size: 10
    }
};
 
  /************************************** Procedure **************************************/

  // Push all the screen slides into the timeline
  // When you want to test the experiment, you can easily comment out the screens you don't want
  timeline.push(preload_screen);
  timeline.push(welcome_screen);
  timeline.push(consent_screen);
  timeline.push(notice_screen);
  timeline.push(browser_screen);
  timeline.push(trial);

  // Run the experiment timeline
  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}
