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

// trials
import { createNewTrial } from "./trials/trialProcess";


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

  var singleSetTrial = {
    timeline: [
        {
            type: psychophysics, // Adding a psychophysics trial
            stimuli: [
                {
                    obj_type: 'circle',
                    startX: 250,
                    startY: 250,
                    radius: 20,
                    line_color: '#000000',
                    fill_color: jsPsych.timelineVariable('color'), // Use variable for color
                }
              ],
              choices: "NO_KEYS",
              trial_duration: 1000,
              post_trial_gap: 2000
        },
        {
          type: psychophysics, // Adding a psychophysics trial
          stimuli: [
              {
                  obj_type: 'circle',
                  startX: 250,
                  startY: 250,
                  radius: 20,
                  line_color: '#000000',
                  fill_color: jsPsych.timelineVariable('color'), // Use variable for color
              }
            ],
            choices: "NO_KEYS",
            post_trial_gap: 100
        },
        {
          type: psychophysics, // Adding a psychophysics trial
          stimuli: [
              {
                  obj_type: 'circle',
                  startX: 250,
                  startY: 250,
                  radius: 20,
                  line_color: '#000000',
                  fill_color: jsPsych.timelineVariable('color'), // Use variable for color
              }
            ],
            choices: "NO_KEYS",
            post_trial_gap: 1000
        },
    ],
    timeline_variables: [
        { face: 'person-1.jpg', name: 'Alex', color: '#FF0000' },
        { face: 'person-2.jpg', name: 'Beth', color: '#00FF00' },
        { face: 'person-3.jpg', name: 'Chad', color: '#0000FF' },
        { face: 'person-4.jpg', name: 'Dave', color: '#FFFF00' }
    ]
};

const trial = {
  type: psychophysics,
  stimuli: generateCircles(grid, 10, calculateCellSize(screenWidth, screenHeight, numColumns, numRows).cellWidth, calculateCellSize(screenWidth, screenHeight, numColumns, numRows).cellHeight),
  choices: "NO_KEYS",
  background_color: '#008000',
  trial_duration: 1000,
  post_trial_gap: 2000,
  timeline_variables: [],
  on_finish: function(data) {
      // Reset grid after each trial
      resetGrid(grid, numColumns, numRows);

      // Example: return data about the trial, e.g., how many cells were occupied at the end
      let occupiedCount = grid.filter(cell => cell.occupied).length;
      return {occupiedCount: occupiedCount}; // Appends this data to the trial's data
  }
};

// Populate timeline_variables with dynamic settings for varied trial configurations
const dynamicStimuliSettings = [
  { numCircles: 5, color: '#FF0000' },
  { numCircles: 8, color: '#00FF00' },
  { numCircles: 10, color: '#0000FF' }
];

trial.timeline_variables = dynamicStimuliSettings.map(settings => ({
  stimuli: generateCircles(grid, settings.numCircles, calculateCellSize(screenWidth, screenHeight, numColumns, numRows).cellWidth, calculateCellSize(screenWidth, screenHeight, numColumns, numRows).cellHeight)
}));

jsPsych.run([trial]);


  // // Create an object to hold the experiment trials
  // const experiment_line:any[] = [];
  
  // Generate experiment trials based on the design parameters (foreach loop)
  // foreach (let itemType of expInfo.DESIGN.itemTypes) {
  // for (let itemType of expInfo.DESIGN.itemTypes) {
  //   for (let condition of expInfo.DESIGN.conditions) {
  //     for (let i = 0; i < expInfo.DESIGN.nTrialsPerCondition; i++) {
  //       let presentationTime = condition * 100; // Calculate the presentation time based on the condition
  //       let encodingDuration:number = 0;
  
  //       if (!expInfo.DESIGN.DualSet) {
  //         if (expInfo.DESIGN.OrientationGroup) {
  //           // Set the encoding duration based on the item type for the orientation group (i can use objects)
  //           encodingDuration = itemType === "clock" ? expInfo.TIMING.EncodingDurations.long : expInfo.TIMING.EncodingDurations.short;
  //         } else {
  //           // Set the encoding duration based on the item type for the non-orientation group
  //           encodingDuration = itemType === "dot" ? expInfo.TIMING.EncodingDurations.long : expInfo.TIMING.EncodingDurations.short;
  //         }
  //       } else {
  //         // Set the encoding duration to medium for DualSet trials
  //         encodingDuration = expInfo.TIMING.EncodingDurations.medium;
  //       }
  
  //       // Create a new trial object and add it to the experiment timeline
  //       let trial_screen = {
  //         type: psychophysics,
  //         stimuli: createNewTrial(condition, itemType),
  //         choices: expInfo.KEYS.CONTINUE,
  //         response_ends_trial: false, // Change this to false to prevent the trial from ending on response
  //         trial_duration: presentationTime,
  //         post_trial_gap: encodingDuration, // Add the encoding duration as the post-trial gap
  //       }

  //       experiment_line.push(trial_screen);
  //     }
  //   }
  // }
  
  // Randomize the order of the trials (commented out)
  // experimentTrials.timeline = [...experimentTrials.timeline].sort(() => Math.random() - 0.5);
 
  /************************************** Procedure **************************************/

  // Push all the screen slides into the timeline
  // When you want to test the experiment, you can easily comment out the screens you don't want
  timeline.push(preload_screen);
  timeline.push(welcome_screen);
  timeline.push(consent_screen);
  timeline.push(notice_screen);
  timeline.push(browser_screen);
  // timeline.push(experiment_line);

  // Run the experiment timeline
  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}
