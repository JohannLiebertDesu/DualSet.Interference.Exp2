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
import { screenWidth, screenHeight, numColumns, numRows, createGrid, resetGrid, calculateCellSize, generateCircles, Stimulus, selectRandomCircle } from "./gridLogic";

// Color wheel drawing function
import { drawColorWheel, outerRadius, ratio } from "./colorWheel";

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

  const displayCirclesStage = {
    type: psychophysics,
    stimuli: function () {
        const numCircles = jsPsych.timelineVariable('numCircles');
        const side = numCircles === 3 ? (Math.random() < 0.5 ? 'left' : 'right') : 'both';  // Randomly choose left or right for 3 circles
        console.log('Generating stimuli with numCircles:', numCircles, 'Side:', side);
        const stimuli = generateCircles(grid, numCircles, cellWidth, cellHeight, side);
        console.log('Generated Stimuli:', stimuli);  // Debug log
        // Store the generated stimuli in the trial data for later use
        jsPsych.data.write({ key: 'stimuli', value: stimuli });
        return stimuli;
    },
    choices: "NO_KEYS",
    background_color: '#FFFFFF',
    trial_duration: 1000,
    on_start: function () {
        console.log('Display Circles Stage started');
    },
    on_finish: function (data) {
        console.log('Display Circles Stage finished');
    }
  };
  
  const blankScreenStageOne = {
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 1000,
    on_start: function () {
        console.log('Blank Screen Stage started');
    },
    on_finish: function (data) {
        console.log('Blank Screen Stage finished');
    }
  };
  
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  const displayFirstCircleStage = {
    type: psychophysics,
    stimuli: function () {
        let previousStimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
        const { selectedStimulus, remainingStimuli } = selectRandomCircle(previousStimuli);
        jsPsych.data.write({ key: 'stimuli', value: remainingStimuli });
        console.log('Selected Circle for Display First Circle Stage:', selectedStimulus);

        const colorWheelObject = drawColorWheel(outerRadius, ratio, [selectedStimulus.startX, selectedStimulus.startY]);

        return [
            colorWheelObject,
            {
                ...selectedStimulus,
                fill_color: 'gray',
                line_color: 'gray',
                original_color: selectedStimulus.original_color,
                change_attr: function (stim, times, frames) {
                    const canvas = document.querySelector('canvas');
                    const context = canvas.getContext('2d');
                    const rect = canvas.getBoundingClientRect();
                    const x = lastMouseX;
                    const y = lastMouseY;
                    const centerX = stim.startX;
                    const centerY = stim.startY;
                    const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180;
                    const color = `hsl(${angle}, 80%, 50%)`;
                    stim.fill_color = color;
                    console.log('Color updated to:', color);
                }
            }
        ];
    },
    choices: "NO_KEYS",
    canvas_size: [screenWidth, screenHeight],
    on_start: function () {
        console.log('Display First Circle Stage started');
    },
    on_finish: function (data) {
        console.log('Display First Circle Stage finished');
    },
    on_load: function () {
        const canvas = document.querySelector('canvas');
        const context = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const stimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
        const currentStimulus = stimuli[stimuli.length - 1];
        lastMouseX = currentStimulus.startX;
        lastMouseY = currentStimulus.startY;

        canvas.addEventListener('mousemove', function (e) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            lastMouseX = x;
            lastMouseY = y;

            const centerX = currentStimulus.startX;
            const centerY = currentStimulus.startY;
            const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180;
            const color = `hsl(${angle}, 80%, 50%)`;

            context.clearRect(0, 0, canvas.width, canvas.height);
            drawColorWheel(outerRadius, ratio, [centerX, centerY]).drawFunc(null, canvas, context);

            context.fillStyle = color;
            context.beginPath();
            context.arc(centerX, centerY, 50, 0, 2 * Math.PI);
            context.fill();
            console.log('Mouse moved:', x, y, 'Color:', color);
        });

        canvas.addEventListener('click', function (e) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = currentStimulus.startX;
            const centerY = currentStimulus.startY;
            const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180;
            const color = `hsl(${angle}, 80%, 50%)`;

            jsPsych.data.write({ selected_color: color });
            console.log('Mouse clicked:', x, y, 'Color:', color);

            jsPsych.finishTrial();
        });
    }
};


const blankScreenStageTwo = {
  type: htmlKeyboardResponse,
  stimulus: '',
  choices: "NO_KEYS",
  trial_duration: 100,
  on_start: function () {
      console.log('Blank Screen Stage started');
  },
  on_finish: function (data) {
      console.log('Blank Screen Stage finished');
  }
};

const displaySecondCircleStage = {
  type: psychophysics,
  stimuli: function () {
      let previousStimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
      const { selectedStimulus, remainingStimuli } = selectRandomCircle(previousStimuli);
      jsPsych.data.write({ key: 'stimuli', value: remainingStimuli });
      console.log('Selected Circle for Display Second Circle Stage:', selectedStimulus);

      const colorWheelObject = drawColorWheel(outerRadius, ratio, [selectedStimulus.startX, selectedStimulus.startY]);

      return [
          colorWheelObject,
          {
              ...selectedStimulus,
              fill_color: 'gray',
              line_color: 'gray',
              original_color: selectedStimulus.original_color,
              change_attr: function (stim, times, frames) {
                  const canvas = document.querySelector('canvas');
                  const context = canvas.getContext('2d');
                  const rect = canvas.getBoundingClientRect();
                  const x = lastMouseX;
                  const y = lastMouseY;
                  const centerX = stim.startX;
                  const centerY = stim.startY;
                  const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180;
                  const color = `hsl(${angle}, 80%, 50%)`;
                  stim.fill_color = color;
                  console.log('Color updated to:', color);
              }
          }
      ];
  },
  choices: "NO_KEYS",
  canvas_size: [screenWidth, screenHeight],
  on_start: function () {
      console.log('Display Second Circle Stage started');
  },
  on_finish: function (data) {
      resetGrid(grid, numColumns, numRows);
      let occupiedCount = grid.filter(cell => cell.occupied).length;
      console.log('Occupied Count:', occupiedCount);
      console.log('Display Second Circle Stage finished');
      return { occupiedCount: occupiedCount };
  },
  on_load: function () {
      const canvas = document.querySelector('canvas');
      const context = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();

      const stimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
      const currentStimulus = stimuli[stimuli.length - 1];
      lastMouseX = currentStimulus.startX;
      lastMouseY = currentStimulus.startY;

      canvas.addEventListener('mousemove', function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          lastMouseX = x;
          lastMouseY = y;

          const centerX = currentStimulus.startX;
          const centerY = currentStimulus.startY;
          const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180;
          const color = `hsl(${angle}, 80%, 50%)`;

          context.clearRect(0, 0, canvas.width, canvas.height);
          drawColorWheel(outerRadius, ratio, [centerX, centerY]).drawFunc(null, canvas, context);

          context.fillStyle = color;
          context.beginPath();
          context.arc(centerX, centerY, 50, 0, 2 * Math.PI);
          context.fill();
          console.log('Mouse moved:', x, y, 'Color:', color);
      });

      canvas.addEventListener('click', function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = currentStimulus.startX;
          const centerY = currentStimulus.startY;
          const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180;
          const color = `hsl(${angle}, 80%, 50%)`;

          jsPsych.data.write({ selected_color: color });
          console.log('Mouse clicked:', x, y, 'Color:', color);

          jsPsych.finishTrial();
      });
  }
};



  /************************************** Procedure **************************************/


  // Define the trial timeline
const trial = {
  timeline: [
      displayCirclesStage,
      blankScreenStageOne,
      displayFirstCircleStage,
      blankScreenStageTwo,
      displaySecondCircleStage
  ],
  timeline_variables: [
      { numCircles: 3 },
      { numCircles: 6 }
  ],
  sample: {
      type: 'fixed-repetitions',
      size: 5
  }
};

  // Push all the screen slides into the timeline
  // When you want to test the experiment, you can easily comment out the screens you don't want

  // Push the basic text display trial into the timeline
  timeline.push(basic_text_trial);

  timeline.push(preload_screen);
  // timeline.push(welcome_screen);
  // timeline.push(consent_screen);
  // timeline.push(notice_screen);
  timeline.push(browser_screen);
  timeline.push(trial);

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