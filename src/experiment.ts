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

import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

// Basic text display trial
const basic_text_trial = {
  type: htmlKeyboardResponse,
  stimulus: '<p>Press any key to begin the experiment.</p>',
  choices: "ALL_KEYS",
  on_finish: () => console.log('Basic text trial finished')
};

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

  console.log('Building timeline');

  /************************************** Instruction **************************************/

  /************************************** Practice **************************************/

  /************************************** Experiment **************************************/

  // Calculate the grid cell size and create the grid
  const grid = createGrid(numColumns, numRows);
  const { cellWidth, cellHeight } = calculateCellSize(screenWidth, screenHeight, numColumns, numRows);
  console.log('Grid created', grid);

  var trial = {
    type: psychophysics,
    stimuli: function (): Stimulus[] {
      const numCircles = jsPsych.timelineVariable('numCircles');
      console.log('Generating stimuli with numCircles:', numCircles);
      const stimuli = generateCircles(grid, numCircles, cellWidth, cellHeight);
      console.log('Generated Stimuli:', stimuli);  // Debug log
      return stimuli;
    },
    choices: "NO_KEYS",
    background_color: '#FFFFFF',
    trial_duration: 1000,
    post_trial_gap: 2000,
    timeline_variables: [
      { numCircles: 3 },
      { numCircles: 6 }
    ],
    sample: {
      type: 'fixed-repetitions',
      size: 1
    },
    on_start: function() {
      console.log('Trial started');
    },
    on_load: function() {
      console.log('Trial loaded');
    },
    on_finish: function (data) {
      resetGrid(grid, numColumns, numRows);  // Reset grid after each trial
      let occupiedCount = grid.filter(cell => cell.occupied).length;
      console.log('Occupied Count:', occupiedCount);  // Debug log
      console.log('Trial finished');  // Debug log
      return { occupiedCount: occupiedCount };
    }
  };

  /************************************** Procedure **************************************/

  // Push all the screen slides into the timeline
  // When you want to test the experiment, you can easily comment out the screens you don't want

  // Push the basic text display trial into the timeline
  timeline.push(basic_text_trial);

  timeline.push(preload_screen);
  // timeline.push(welcome_screen);
  // timeline.push(consent_screen);
  // timeline.push(notice_screen);
  timeline.push(browser_screen);
  timeline.push({
    timeline: [trial],
    timeline_variables: [
      { numCircles: 3 },
      { numCircles: 6 }
    ],
    sample: {
      type: 'fixed-repetitions',
      size: 1
    }
  });

  console.log('Timeline built', timeline);

  try {
    // Run the experiment timeline
    console.log('Starting jsPsych.run');
    await jsPsych.run(timeline);
    console.log('Experiment finished');
  } catch (error) {
    console.error('Error running jsPsych experiment:', error);
  }

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}