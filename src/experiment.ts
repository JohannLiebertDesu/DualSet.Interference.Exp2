/**
 * @title DualSet.Interference.Exp1
 * @description Systematically varying the combination possibilities and numbers of 2 sets that need to be memorized, including color patches and orientations. Variations include screen side, mixing or separating the qualitatively different items. Each trial concludes with the reproduction of 2 items.
 * @author Chenyu Li, ChatGPT and Noah Rischert
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
import { expInfo, varSystem, counters } from "./settings";

// screens
import { welcome_screen } from "./instructions/welcome";
import { consent_screen, notice_screen } from "./instructions/consent";
import { browser_screen } from "./instructions/browserCheck";
import { fullMode_screen } from "./instructions/fullScreen";
import { instructionSlidesConfig } from "./instructions/InstrStart";
import { getDualSetWarning, singleSetWarning } from "./instructions/InstrWarnings";
import { createQuickBreakScreen } from './instructions/breaks';
import { survey_screen } from "./experimentEnd/survey";
import { debrief_screen } from "./experimentEnd/debriefing";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, numColumns, numRows, createGrid, calculateCellSize, placeAndGenerateStimuli, resetGrid, closeFullScreen } from "./gridAndStimuli";

// Trial screens preparation
import { blankScreenStageOneShort, blankScreenStageOneLong, blankScreenStageTwo, blankScreenStageThree, createColorWheelStage, createOrientationWheelStage } from './trialScreensPreparation';


import { create } from "domain";

// Import the data storage function
import { storeTrialData } from './data/dataStorage';


// Calculate the grid cell size and create the grid
export const grid = createGrid(numColumns, numRows);
export const { cellWidth, cellHeight } = calculateCellSize(screenWidth, screenHeight, numColumns, numRows);

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
    };
  
    console.log('Building timeline');
  

    /************************************** Experiment **************************************/

    /************************************** Block 1 preparation **************************************/

// Prepare displaying the stimuli for the single set
const displayStimuliSingleSet = {
  type: psychophysics,
  stimuli: function () {
      const numCircles = jsPsych.timelineVariable('numCircles');
      const stimulusType = jsPsych.timelineVariable('stimulusType');
      const side = numCircles === 3 ? 'left' : 'both';
      const stimuli = placeAndGenerateStimuli(grid, numCircles, cellWidth, cellHeight, side, stimulusType);
      jsPsych.data.write({ key: 'stimuli', value: stimuli });
      jsPsych.data.write({ key: 'stimulusType', value: stimulusType }); // Save stimulus type for later
      return stimuli;
  },
  choices: "NO_KEYS",
  background_color: '#FFFFFF',
  trial_duration: function() {
      return 100 * jsPsych.timelineVariable('numCircles');
  },
  on_start: function (trial) {
      trial.start_time = performance.now(); // Log start time
      console.log(`Trial started at ${trial.start_time}`);
  },
  on_finish: function (data) {
      const end_time = performance.now(); // Log end time
      const duration = end_time - data.start_time; // Calculate duration
      jsPsych.data.write({ key: 'actual_trial_duration', value: duration }); // Save duration
      console.log(`Trial ended at ${end_time}`);
      console.log(`Trial duration set: ${100 * jsPsych.timelineVariable('numCircles')} ms, Actual duration: ${duration} ms`);
  }
};


// The folloing are just some tools for timeline construction of the single set trial

const shouldDisplayColorWheel = () => {
    const stimulusType = jsPsych.timelineVariable('stimulusType');
    return stimulusType === 'circle';
};

const shouldDisplayOrientationWheel = () => {
    const stimulusType = jsPsych.timelineVariable('stimulusType');
    return stimulusType === 'circle_with_line';
};

const colorWheelNode = {
    timeline: [
        createColorWheelStage(
            'Display First Color Wheel',
            jsPsych.timelineVariable('stimulusType'),
            'stimuli', // Data key for single set block
            function (data) {}
        )
    ],
    conditional_function: shouldDisplayColorWheel
};

const orientationWheelNode = {
    timeline: [
        createOrientationWheelStage(
            'Display First Orientation Wheel',
            jsPsych.timelineVariable('stimulusType'),
            'stimuli', // Data key for single set block
            function (data) {}
        )
    ],
    conditional_function: shouldDisplayOrientationWheel
};

// This is the actual timeline logic for the single set trial
const singleSetTrialConfig = {
    timeline: [
        displayStimuliSingleSet,
        {
            timeline: [
                {
                    timeline: [blankScreenStageOneLong],
                    conditional_function: function() {
                        return (jsPsych.timelineVariable('stimulusType', true) === 'circle' && expInfo.DESIGN.participantGroup === 'colorFirst') ||
                               (jsPsych.timelineVariable('stimulusType', true) === 'circle_with_line' && expInfo.DESIGN.participantGroup === 'orientationFirst');
                    }
                },
                {
                    timeline: [blankScreenStageOneShort],
                    conditional_function: function() {
                        return !((jsPsych.timelineVariable('stimulusType', true) === 'circle' && expInfo.DESIGN.participantGroup === 'colorFirst') ||
                                 (jsPsych.timelineVariable('stimulusType', true) === 'circle_with_line' && expInfo.DESIGN.participantGroup === 'orientationFirst'));
                    }
                }
            ]
        },
        colorWheelNode,
        orientationWheelNode,
        blankScreenStageTwo,
        {
            timeline: [
                createColorWheelStage(
                    'Display Second Color Wheel',
                    jsPsych.timelineVariable('stimulusType'),
                    'stimuli', // Data key for single set block
                    function (data) {
                        resetGrid(grid, numColumns, numRows);
                    }
                )
            ],
            conditional_function: shouldDisplayColorWheel
        },
        {
            timeline: [
                createOrientationWheelStage(
                    'Display Second Orientation Wheel',
                    jsPsych.timelineVariable('stimulusType'),
                    'stimuli', // Data key for single set block
                    function (data) {
                        resetGrid(grid, numColumns, numRows);
                    }
                )
            ],
            conditional_function: shouldDisplayOrientationWheel
        },
        blankScreenStageThree
    ],
    timeline_variables: [
        { numCircles: 3, stimulusType: 'circle' },
        { numCircles: 3, stimulusType: 'circle_with_line' },
        { numCircles: 6, stimulusType: 'circle' },
        { numCircles: 6, stimulusType: 'circle_with_line' }
    ],
};


// Define the configurations for practice and actual trials
const single_set_trial_practice = {
  ...singleSetTrialConfig,
  sample: {
      type: 'fixed-repetitions',
      size: 1 // Adjust size for practice trials
  },
  practice: true // Set practice status to true for practice trials
};

const single_set_trial = {
  ...singleSetTrialConfig,
  sample: {
      type: 'fixed-repetitions',
      size: 1 // Adjust size for actual trials
  },
  practice: false // Set practice status to false for actual trials
};


      
            
    /************************************** Block 2 preparation **************************************/

    const participantGroup = expInfo.DESIGN.participantGroup;
    const participantBlockType = expInfo.DESIGN.participantBlockType;

    // Display stimuli for the dual set

    const displayStimuliDualSet = {
        type: psychophysics,
        stimuli: function () {
          // Helper function to generate stimuli
          const generateStimuli = (numCircles, side, stimulusType) => {
            return placeAndGenerateStimuli(grid, numCircles, cellWidth, cellHeight, side, stimulusType);
          };
      
          // Determine the first and second stimulus types based on participant group
          const firstStimulusType = (participantGroup === 'colorFirst') ? 'circle' : 'circle_with_line';
          const secondStimulusType = (firstStimulusType === 'circle') ? 'circle_with_line' : 'circle';
      
          // Generate stimuli for both sides
          const firstStimuli = generateStimuli(3, 'left', firstStimulusType);
          const secondStimuli = generateStimuli(3, 'right', secondStimulusType);
      
          // Log and save data for the first stimuli
          console.log('First Stimuli:', firstStimuli);
          jsPsych.data.write({ key: 'firstStimuli', value: firstStimuli });
          jsPsych.data.write({ key: 'firstStimulusType', value: firstStimulusType });
      
          // Log and save data for the second stimuli
          console.log('Second Stimuli:', secondStimuli);
          jsPsych.data.write({ key: 'secondStimuli', value: secondStimuli });
          jsPsych.data.write({ key: 'secondStimulusType', value: secondStimulusType });
      
          // Set timing for the stimuli
          const firstStimuliWithTiming = firstStimuli.map(stim => ({
            ...stim,
            show_start_time: 0,
            show_end_time: 300
          }));
      
          const blankScreen = {
            obj_type: 'text',
            content: '', // Blank screen
            show_start_time: 300, // Start after the first stimuli
            show_end_time: 2300 // End after 2000ms blank screen
          };
      
          const secondStimuliWithTiming = secondStimuli.map(stim => ({
            ...stim,
            show_start_time: 2300,
            show_end_time: 2600
          }));
      
          // Return the sequence of stimuli
          return [
            ...firstStimuliWithTiming,
            blankScreen,
            ...secondStimuliWithTiming
          ];
        },
        choices: "NO_KEYS",
        background_color: '#FFFFFF',
        trial_duration: 2600, // Total duration: 300ms (first stimuli) + 2000ms (blank) + 300ms (second stimuli)
        on_start: function () {
          console.log('Display Circles Stage started');
        },
        on_finish: function (data) {
          // Store the stimuli information in the trial data
          const firstStimulusType = (participantGroup === 'colorFirst') ? 'circle' : 'circle_with_line';
          const secondStimulusType = (firstStimulusType === 'circle') ? 'circle_with_line' : 'circle';
          jsPsych.data.addProperties({
            firstStimulusType: firstStimulusType,
            secondStimulusType: secondStimulusType
          });
          console.log('Data stored in on_finish: ', {
            firstStimulusType: firstStimulusType,
            secondStimulusType: secondStimulusType
          });
          console.log('Display Circles Stage finished');
        }
      };
    
      // The following code is in preparation for the systematic and random block of the dual set trial

      // Create a conditional timeline for the systematic block of the dual set trial
      function createConditionalTimeline(firstStimulusType, firstStage, secondStage) {
        return {
          timeline: [
            firstStage,
            blankScreenStageTwo,
            secondStage
          ],
          conditional_function: function() {
            const lastTrialData = jsPsych.data.get().last(1).values()[0];
            return lastTrialData && lastTrialData.firstStimulusType === firstStimulusType;
          }
        };
      }
      
        // Create a conditional timeline for the random block of the dual set trial
      function createRandomConditionalTimeline(randomStimulusType, firstStimulusType, firstStage, secondStage) {
        return {
          timeline: [
            firstStage,
            blankScreenStageTwo,
            secondStage
          ],
          conditional_function: function() {
            const lastTrialData = jsPsych.data.get().last(1).values()[0];
            return jsPsych.timelineVariable('randomStimulusType') === randomStimulusType && lastTrialData && lastTrialData.firstStimulusType === firstStimulusType;
          }
        };
      }
      
      // Create a systematic timeline for the dual set trial
      const systematicTimeline = {
        timeline: [
          createConditionalTimeline('circle', 
            createColorWheelStage('Display First Color Wheel', 'circle', 'firstStimuli', function (data) {}), 
            createOrientationWheelStage('Display Second Orientation Wheel', 'circle_with_line', 'secondStimuli', function (data) {
              resetGrid(grid, numColumns, numRows);
            })
          ),
          createConditionalTimeline('circle_with_line', 
            createOrientationWheelStage('Display First Orientation Wheel', 'circle_with_line', 'firstStimuli', function (data) {}), 
            createColorWheelStage('Display Second Color Wheel', 'circle', 'secondStimuli', function (data) {
              resetGrid(grid, numColumns, numRows);
            })
          )
        ],
        conditional_function: function() {
          return participantBlockType === 'systematic';
        }
      };
      
      // Create a random timeline for the dual set trial
      const randomTimeline = {
        timeline: [
          createRandomConditionalTimeline('circle', 'circle', 
            createColorWheelStage('Display Random Color Wheel', 'circle', 'firstStimuli', function (data) {}), 
            createOrientationWheelStage('Display Random Orientation Wheel', 'circle_with_line', 'secondStimuli', function (data) {
              resetGrid(grid, numColumns, numRows);
            })
          ),
          createRandomConditionalTimeline('circle', 'circle_with_line', 
            createColorWheelStage('Display Random Color Wheel', 'circle', 'secondStimuli', function (data) {}), 
            createOrientationWheelStage('Display Random Orientation Wheel', 'circle_with_line', 'firstStimuli', function (data) {
              resetGrid(grid, numColumns, numRows);
            })
          ),
          createRandomConditionalTimeline('circle_with_line', 'circle_with_line', 
            createOrientationWheelStage('Display Random Orientation Wheel', 'circle_with_line', 'firstStimuli', function (data) {}), 
            createColorWheelStage('Display Random Color Wheel', 'circle', 'secondStimuli', function (data) {
              resetGrid(grid, numColumns, numRows);
            })
          ),
          createRandomConditionalTimeline('circle_with_line', 'circle', 
            createOrientationWheelStage('Display Random Orientation Wheel', 'circle_with_line', 'secondStimuli', function (data) {}), 
            createColorWheelStage('Display Random Color Wheel', 'circle', 'firstStimuli', function (data) {
              resetGrid(grid, numColumns, numRows);
            })
          )
        ],
        conditional_function: function() {
          return participantBlockType === 'random';
        }
      };
      
      // Define the dual set trial configuration
      const dualSetTrialConfig = {
        timeline: [
            displayStimuliDualSet,
            blankScreenStageOneShort,
            systematicTimeline,
            randomTimeline,
            blankScreenStageThree // Include blankScreenStageThree at the end
        ],
        timeline_variables: [
            { randomStimulusType: 'circle' },
            { randomStimulusType: 'circle_with_line' }
        ]
    };
    
      // Define the configurations for practice and actual trials
      const dual_set_trial_practice = {
        ...dualSetTrialConfig,
        sample: {
            type: 'fixed-repetitions',
            size: 1 // Adjust size for practice trials
        },
        practice: true // Set practice status to true for practice trials
      };

      const dual_set_trial = {
        ...dualSetTrialConfig,
        sample: {
            type: 'fixed-repetitions',
            size: 1 // Adjust size for actual trials
        },
        practice: false // Set practice status to false for actual trials
      };


    /************************************** Procedure **************************************/


    timeline.push(preload_screen);
    timeline.push(welcome_screen);
    timeline.push(consent_screen);
    timeline.push(notice_screen);
    timeline.push(browser_screen);
    timeline.push(fullMode_screen);
    timeline.push(instructionSlidesConfig);

    // Here, we decide on the order of the blocks; do we first show the dual set or the single set? This depends on the participantBlockOrder
    if (expInfo.DESIGN.participantBlockOrder === 'dualSetFirst') {
      // Tell participants what to expect in the upcoming block
      timeline.push(getDualSetWarning(expInfo.DESIGN.participantBlockType));
      // Let them practice a bit
      timeline.push(dual_set_trial_practice);
      for (let i = 0; i < 3; i++) {  // Loop through the 3 segments of the block
        timeline.push(dual_set_trial);
        timeline.push(createQuickBreakScreen()); // Add a quick break screen
        counters.segmentNumber++;
      }
      // Reset the counters for the next block
      counters.blockNumber++;
      counters.segmentNumber = 1;
      counters.trialNumberThisBlock = 1;
      timeline.push(singleSetWarning);
      timeline.push(single_set_trial_practice);
      for (let i = 0; i < 3; i++) {
        timeline.push(single_set_trial);
        timeline.push(createQuickBreakScreen());
        counters.segmentNumber++;
      }
      // Do the same thing in the other case
  } else {
      timeline.push(singleSetWarning);
      timeline.push(single_set_trial_practice);
      for (let i = 0; i < 3; i++) {
        timeline.push(single_set_trial);
        timeline.push(createQuickBreakScreen());
        counters.segmentNumber++;
      }
      counters.blockNumber++;
      counters.segmentNumber = 1;
      counters.trialNumberThisBlock = 1;
      timeline.push(getDualSetWarning(expInfo.DESIGN.participantBlockType));
      timeline.push(dual_set_trial_practice);
      for (let i = 0; i < 3; i++) {
        timeline.push(dual_set_trial);
        timeline.push(createQuickBreakScreen());
        counters.segmentNumber++;
      }
  }

    timeline.push(survey_screen);
    timeline.push(debrief_screen);
    timeline.push(closeFullScreen);
    console.log("Final Timeline: ", timeline);

    // Initialize and run the experiment
    jsPsych.run(timeline);



  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}