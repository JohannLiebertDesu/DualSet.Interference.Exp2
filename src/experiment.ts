/**
 * @title DualSet.Interference.Exp1
 * @description Systematically varying the combination possibilities and numbers of 2 sets that need to be memorized, including color patches and orientations. Variations include screen side, mixing or separating the qualitatively different items. Each trial concludes with the reproduction of 2 items.
 * @author Noah Rischert, Chenyu Li and ChatGPT 4o
 * @version 2.0.2
 *
 *
 * @assets assets/
 */

// Here we just generally import all the relevant files and packages. The packages are imported from the node_modules folder, and are a central component of jsPsych. Most of them come from the jsPsych library, some of them were made by our lab. 

// import stylesheets (.scss or .css).
import "../styles/main.scss";

// jsPsych official plugin
import preload from "@jspsych/plugin-preload";
import psychophysics from "@kurokida/jspsych-psychophysics";
import jsPsychCallFunction from "@jspsych/plugin-call-function";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

// Global variables
import { jsPsych } from "./jsp";
import { DESIGN, counters, assignParticipantGroup } from "./settings";

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
import { practiceOver } from "./instructions/afterPracticeScreen";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, numColumns, numRows, createGrid, calculateCellSize, placeAndGenerateStimuli, resetGrid, closeFullScreen, Stimulus } from "./gridAndStimuli";

// Trial screens preparation
import { blankScreenStageOneShort, blankScreenStageOneLong, blankScreenStageTwo, blankScreenStageThree, createColorWheelStage, createOrientationWheelStage } from './trialScreensPreparation';

import { create } from "domain";

import { assignSubjectID, initializeSubjectsList } from "./participantCounterbalancing";

// Import the data storage function
import { storeTrialData, incrementCounters, resetBlockCounters, incrementSegmentNumber, resetTrialinBlockCounter } from './data/dataStorage';

// Calculate the grid cell size and create the grid
export const grid = createGrid(numColumns, numRows);
export const { cellWidth, cellHeight } = calculateCellSize(screenWidth, screenHeight, numColumns, numRows);

// Initialize subjectID with a type annotation to be number or null
let subjectID: number | null = null;

// Export subjectID
export { subjectID };

// Here we come to the main component of the code, the experiment itself. All of it is executed as part of the run function (so jsPsych.run), which is automatically executed when jsPsych is initialized. This happens in the jsp.ts file.
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

    // Initialize a main timeline to hold the trials. JsPsych will at the very beginning of the experiment prepare and define all the timelines (which are all considered as unique trials by jsPsych) that we added to the main timeline, and then run them one by one.
    var main_timeline: any[] = [];
  
    // Preload assets
    const preload_screen = {
      type: preload,
      images: assetPaths.images,
    };
  
    console.log('Building timeline');
  

    /************************************** Experiment **************************************/

    // I have separated the code into different sections, one for the preparation of the first kind of block type (single set), and one for the second kind of block type (dual set). Then, in a third part, I push all of the trials i have created into the timelines.

    /************************************** Block 1 preparation **************************************/

// Prepare displaying the stimuli for the single set

// Global variable to store stimuli temporarily, this kind of stuff is done to appese TypeScript
let currentStimuli: Stimulus[] = [];

const displayStimuliSingleSet = {
  type: psychophysics,
  stimuli: function () {
    // Retrieve the number of circles and stimulus type from the timeline variables
    const numCircles = jsPsych.timelineVariable('numCircles');
    const stimulusType = jsPsych.timelineVariable('stimulusType');
    
    // Determine the side based on the number of circles
    const side = numCircles === 3 ? 'left' : 'both';
    
    // Generate the stimuli using the specified parameters
    const stimuli = placeAndGenerateStimuli(grid, numCircles, cellWidth, cellHeight, side, stimulusType);

    // Store the generated stimuli in the global variable
    currentStimuli = stimuli;

    // Log the generated stimuli for debugging
    console.log('Generated stimuli:', stimuli);

    // Write the stimuli and stimulus type to jsPsych data for later use
    jsPsych.data.write({ key: 'stimuli', value: stimuli });
    jsPsych.data.write({ key: 'stimulusType', value: stimulusType });
    
    // Return the stimuli to be displayed
    return stimuli;
  },
  choices: "NO_KEYS",
  background_color: '#FFFFFF',
  trial_duration: function () {
    // Set the trial duration based on the number of circles
    return 100 * jsPsych.timelineVariable('numCircles');
  },
  on_start: function (trial) {
    // Log the start time of the trial
    trial.start_time = performance.now();
    console.log(`Trial started at ${trial.start_time}`);
  },
  on_finish: function (data) {
    // Log the end time of the trial and calculate the duration
    const end_time = performance.now();
    const duration = end_time - data.start_time;

    // Get the practice status from the parent timeline
    const practice = jsPsych.timelineVariable('practice');

    // Write the actual trial duration to jsPsych data
    jsPsych.data.write({ key: 'actual_trial_duration', value: duration });
    console.log(`Trial ended at ${end_time}`);
    console.log(`Trial duration set: ${100 * jsPsych.timelineVariable('numCircles')} ms, Actual duration: ${duration} ms`);

    // Retrieve the stimuli from the global variable
    const stimuli = currentStimuli;
    console.log('Retrieved stimuli:', stimuli);

    // Check if stimuli data is available
    if (!stimuli) {
      console.error('Stimuli data not found');
      return;
    }

    // Define types for positions, colors, and orientations
    type Position = { startX: number; startY: number };
    type Color = string;
    type Orientation = { x2: number; y2: number };

    // Initialize variables for storing positions, colors, and orientations
    let allPositions: Position[] = [];
    let allColors: Color[] = [];
    let allOrientations: Orientation[] = [];

    // Process each stimulus and store relevant data based on its type
    stimuli.forEach((stimulus: Stimulus) => {
      if (stimulus.obj_type === 'circle') {
        // Store positions for circles
        allPositions.push({ startX: stimulus.startX!, startY: stimulus.startY! });
        // Store original color if available
        if (stimulus.original_color) {
          allColors.push(stimulus.original_color);
        }
      } else if (stimulus.obj_type === 'line') {
        // Store orientations for lines
        allOrientations.push({ x2: stimulus.x2!, y2: stimulus.y2! });
      }
    });

    // Convert arrays to strings for storage, or keep them as arrays based on preference
    const allPositionsStr = JSON.stringify(allPositions);
    const allColorsStr = JSON.stringify(allColors);
    const allOrientationsStr = JSON.stringify(allOrientations);

    // Prepare the trial data object with various information
    const trialData = {
      practice: practice,
      nStimuli: jsPsych.timelineVariable('numCircles', true),
      stimulusType: jsPsych.timelineVariable('stimulusType', true),
      trialNumberThisBlock: counters.trialNumberThisBlock,
      trialNumberOverall: counters.trialNumberOverall,
      blockNumber: counters.blockNumber,
      segmentNumber: counters.segmentNumber,
      subjectID: subjectID,
      whichStimuliFirst: DESIGN.participantGroup,
      areTrialsRandomOrSystematic: DESIGN.participantBlockType,
      dualOrSingleSetFirst: DESIGN.participantBlockOrder,
      allPositions: allPositionsStr || null,
      allColors: allColorsStr || null,
      allOrientations: allOrientationsStr || null
    };

    // Save the trial data
    storeTrialData(trialData);
  }
};

// The following are just some tools for timeline construction of the single set trial

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

// Configuration for a single set trial
const singleSetTrialConfig = {
  timeline: [
      // Step 1: Display initial stimuli
      displayStimuliSingleSet,

      // Step 2: Conditional display of a blank screen (long or short) based on stimulus type and participant group
      {
          timeline: [
              // Display long blank screen if conditions are met
              {
                  timeline: [blankScreenStageOneLong],
                  conditional_function: function() {
                      return (jsPsych.timelineVariable('stimulusType', true) === 'circle' && DESIGN.participantGroup === 'colorFirst') ||
                             (jsPsych.timelineVariable('stimulusType', true) === 'circle_with_line' && DESIGN.participantGroup === 'orientationFirst');
                  }
              },
              // Display short blank screen if conditions are not met
              {
                  timeline: [blankScreenStageOneShort],
                  conditional_function: function() {
                      return !((jsPsych.timelineVariable('stimulusType', true) === 'circle' && DESIGN.participantGroup === 'colorFirst') ||
                               (jsPsych.timelineVariable('stimulusType', true) === 'circle_with_line' && DESIGN.participantGroup === 'orientationFirst'));
                  }
              }
          ]
      },

      // Step 3: Display the color wheel node
      colorWheelNode,

      // Step 4: Display the orientation wheel node
      orientationWheelNode,

      // Step 5: Display a second blank screen stage
      blankScreenStageTwo,

      // Step 6: Conditional display of the second color wheel stage
      {
          timeline: [
              {
                  timeline: [
                      createColorWheelStage(
                          'Display Second Color Wheel',
                          jsPsych.timelineVariable('stimulusType'),
                          'stimuli', // Data key for single set block
                          function (data) {
                              resetGrid(grid, numColumns, numRows); // Reset the grid after displaying the color wheel
                          }
                      ),
                      {
                        type: jsPsychCallFunction,
                        func: incrementCounters
                      },
                  ],
              }
          ],
          conditional_function: shouldDisplayColorWheel // Function to determine if the second color wheel should be displayed
      },

      // Step 7: Conditional display of the second orientation wheel stage
      {
          timeline: [
              {
                  timeline: [
                      createOrientationWheelStage(
                          'Display Second Orientation Wheel',
                          jsPsych.timelineVariable('stimulusType'),
                          'stimuli', // Data key for single set block
                          function (data) {
                              resetGrid(grid, numColumns, numRows); // Reset the grid after displaying the orientation wheel
                          }
                      ),
                      {
                        type: jsPsychCallFunction,
                        func: incrementCounters
                      },
                  ],
              }
          ],
          conditional_function: shouldDisplayOrientationWheel // Function to determine if the second orientation wheel should be displayed
      },

      // Step 8: Display a third blank screen stage
      blankScreenStageThree
  ],

  // Define the variables for the timeline
  timeline_variables: [
      { numCircles: 3, stimulusType: 'circle' }, // 3 circles without lines
      { numCircles: 3, stimulusType: 'circle_with_line' }, // 3 circles with lines
      { numCircles: 6, stimulusType: 'circle' }, // 6 circles without lines
      { numCircles: 6, stimulusType: 'circle_with_line' } // 6 circles with lines
  ],
};



// Define the configurations for practice and actual trials
const single_set_trial_practice = {
  ...singleSetTrialConfig,
  sample: {
      type: 'fixed-repetitions',
      size: 1 // Adjust size for practice trials, since we have 4 timeline variables which are repeated 3 times, we get 12 practice trials in total.
  },
  timeline_variables: singleSetTrialConfig.timeline_variables.map(tv => ({...tv, practice: true})) // Set practice status to true for practice trials
};

const single_set_trial = {
  ...singleSetTrialConfig,
  sample: {
      type: 'fixed-repetitions',
      size: 1 // Adjust size for actual trials, since we have 4 timeline variables which are repeated 8 times, we get 32 actual trials in total.
  },
  timeline_variables: singleSetTrialConfig.timeline_variables.map(tv => ({...tv, practice: false})) // Set practice status to false for actual trials
};


      
            
/************************************** Block 2 preparation **************************************/

// Display stimuli for the dual set

const displayStimuliDualSet = {
  type: psychophysics,
  stimuli: function () {
    // Helper function to generate stimuli
    const generateStimuli = (numCircles, side, stimulusType) => {
      return placeAndGenerateStimuli(grid, numCircles, cellWidth, cellHeight, side, stimulusType);
    };

    // Determine the first and second stimulus types based on participant group
    const firstStimulusType = (DESIGN.participantGroup === 'colorFirst') ? 'circle' : 'circle_with_line';
    const secondStimulusType = (firstStimulusType === 'circle') ? 'circle_with_line' : 'circle';

    // Generate stimuli for both sides
    const firstStimuli = generateStimuli(3, 'left', firstStimulusType);
    const secondStimuli = generateStimuli(3, 'right', secondStimulusType);

    // Store the generated stimuli in the global variable
    currentStimuli = [...firstStimuli, ...secondStimuli];

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
    const firstStimulusType = (DESIGN.participantGroup === 'colorFirst') ? 'circle' : 'circle_with_line';
    const secondStimulusType = (firstStimulusType === 'circle') ? 'circle_with_line' : 'circle';
    
    // Get the practice status from the parent timeline
    const practice = jsPsych.timelineVariable('practice');

    jsPsych.data.addProperties({
      firstStimulusType: firstStimulusType,
      secondStimulusType: secondStimulusType,
    });
    console.log('Data stored in on_finish: ', {
      firstStimulusType: firstStimulusType,
      secondStimulusType: secondStimulusType,
    });
    console.log('Display Circles Stage finished');

    // Retrieve the stimuli from the global variable
    const stimuli = currentStimuli;
    console.log('Retrieved stimuli:', stimuli);

    // Check if stimuli data is available
    if (!stimuli) {
      console.error('Stimuli data not found');
      return;
    }

    // Define types for positions, colors, and orientations
    type Position = { startX: number; startY: number };
    type Color = string;
    type Orientation = { x2: number; y2: number };

    // Initialize variables for storing positions, colors, and orientations
    let allPositions: Position[] = [];
    let allColors: Color[] = [];
    let allOrientations: Orientation[] = [];

    // Process each stimulus and store relevant data based on its type
    stimuli.forEach((stimulus: Stimulus) => {
      if (stimulus.obj_type === 'circle') {
        // Store positions for circles
        allPositions.push({ startX: stimulus.startX!, startY: stimulus.startY! });
        // Store original color if available
        if (stimulus.original_color) {
          allColors.push(stimulus.original_color);
        }
      } else if (stimulus.obj_type === 'line') {
        // Store orientations for lines
        allOrientations.push({ x2: stimulus.x2!, y2: stimulus.y2! });
      }
    });

    // Convert arrays to strings for storage, or keep them as arrays based on preference
    const allPositionsStr = JSON.stringify(allPositions);
    const allColorsStr = JSON.stringify(allColors);
    const allOrientationsStr = JSON.stringify(allOrientations);

    // Prepare the trial data object with various information
    const trialData = {
      practice: practice,
      nStimuli: 6,  // Hard-coded value
      stimulusType: "circle and circle_with_line",  // Hard-coded value
      trialNumberThisBlock: counters.trialNumberThisBlock,
      trialNumberOverall: counters.trialNumberOverall,
      blockNumber: counters.blockNumber,
      segmentNumber: counters.segmentNumber,
      subjectID: subjectID,
      whichStimuliFirst: DESIGN.participantGroup,
      areTrialsRandomOrSystematic: DESIGN.participantBlockType,
      dualOrSingleSetFirst: DESIGN.participantBlockOrder,
      allPositions: allPositionsStr || null,
      allColors: allColorsStr || null,
      allOrientations: allOrientationsStr || null
    };

    // Save the trial data
    storeTrialData(trialData);
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
        createOrientationWheelStage('Display Second Orientation Wheel', 'circle_with_line', 'secondStimuli', function (data) {}), 
        createColorWheelStage('Display First Color Wheel', 'circle', 'firstStimuli', function (data) {
          resetGrid(grid, numColumns, numRows);
        })
      ),
      createConditionalTimeline('circle_with_line', 
        createColorWheelStage('Display Second Color Wheel', 'circle', 'secondStimuli', function (data) {}),
        createOrientationWheelStage('Display First Orientation Wheel', 'circle_with_line', 'firstStimuli', function (data) {
          resetGrid(grid, numColumns, numRows);
        })
      )
    ],
    conditional_function: function() {
      return DESIGN.participantBlockType === 'systematic';
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
      return DESIGN.participantBlockType === 'random';
    }
  };
  
  // Define the dual set trial configuration
  const dualSetTrialConfig = {
    timeline: [
        displayStimuliDualSet,
        blankScreenStageOneShort,
        {
          type: jsPsychCallFunction,
          func: incrementCounters
        },
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
        size: 1 // Adjust size for practice trials, since we have 2 timeline variables which are repeated 6 times, we get 12 practice trials in total.
    },
    timeline_variables: dualSetTrialConfig.timeline_variables.map(tv => ({...tv, practice: true})) // Set practice status to true for practice trials
  };

  const dual_set_trial = {
    ...dualSetTrialConfig,
    sample: {
        type: 'fixed-repetitions',
        size: 1 // Adjust size for actual trials, since we have 2 timeline variables which are repeated 16 times, we get 32 actual trials in total.
    },
    timeline_variables: dualSetTrialConfig.timeline_variables.map(tv => ({...tv, practice: false})) // Set practice status to false for actual trials
  };


    /************************************** Procedure **************************************/


    // Define the preload screen timeline
    let empty_trial = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: "",
      trial_duration: 150, // Increase the duration to account for the pause
      on_start: function() {
        initializeSubjectsList();
        console.log("Subjects list initialized.");
    
        // Pause for 100ms, because even with all my efforts to separate the initialization of the subjects from the rest of the experiment, the code still has too little time in between the two times it tries to access the batch session data from jatos.
        return new Promise(resolve => setTimeout(resolve, 100));
      },
      on_finish: function() {
          // Initialize subjects and get the participant ID
          let subjectID = assignSubjectID();
  
          if (subjectID !== null) {
              // Assign participant to a group using their ID
              const { group, blockType, blockOrder } = assignParticipantGroup(subjectID);
  
              // Update DESIGN object with participant's group info
              DESIGN.participantGroup = group;
              DESIGN.participantBlockType = blockType;
              DESIGN.participantBlockOrder = blockOrder;

              console.log("group: ", group);
              console.log("blockType: ", blockType);
              console.log("blockOrder: ", blockOrder);
  
          } else {
              throw new Error("Failed to initialize participant ID.");
          }
          console.log("subjectID: ", subjectID);
    
          var timeline: any[] = [];
          
          timeline.push(preload_screen);
          timeline.push(welcome_screen);
          timeline.push(consent_screen);
          timeline.push(notice_screen);
          timeline.push(browser_screen);
          timeline.push(fullMode_screen);
          timeline.push(instructionSlidesConfig);

          // Here, we decide on the order of the blocks; do we first show the dual set or the single set? This depends on the participantBlockOrder
          if (DESIGN.participantBlockOrder === 'dualSetFirst') {
            // Dual Set First
            console.log("Dual Set First");
            timeline.push(getDualSetWarning(DESIGN.participantBlockType));
            timeline.push(dual_set_trial_practice);
            timeline.push({
              timeline: [practiceOver],
              on_timeline_finish: resetTrialinBlockCounter
            });
            
            for (let i = 0; i < 3; i++) {
                timeline.push({
                    timeline: [dual_set_trial, createQuickBreakScreen()],
                    on_timeline_finish: incrementSegmentNumber
                });
            }
        
            // Reset counters after the dual set block
            timeline.push({
                type: jsPsychCallFunction,
                func: resetBlockCounters
            });
            
            timeline.push(singleSetWarning);
            timeline.push(single_set_trial_practice);
            timeline.push({
              timeline: [practiceOver],
              on_timeline_finish: resetTrialinBlockCounter
            });
            
            for (let i = 0; i < 3; i++) {
                timeline.push({
                    timeline: [single_set_trial, createQuickBreakScreen()],
                    on_timeline_finish: incrementSegmentNumber
                });
            }
        } else {
            console.log("Single Set First");
            console.log("participantBlockType: ", DESIGN.participantBlockType)
            // Single Set First
            timeline.push(singleSetWarning);
            timeline.push(single_set_trial_practice);
            timeline.push({
              timeline: [practiceOver],
              on_timeline_finish: resetTrialinBlockCounter
            });
            
            for (let i = 0; i < 3; i++) {
                timeline.push({
                    timeline: [single_set_trial, createQuickBreakScreen()],
                    on_timeline_finish: incrementSegmentNumber
                });
            }
        
            // Reset counters after the single set block
            timeline.push({
                type: jsPsychCallFunction,
                func: resetBlockCounters
            });
            
            timeline.push(getDualSetWarning(DESIGN.participantBlockType));
            timeline.push(dual_set_trial_practice);
            timeline.push({
              timeline: [practiceOver],
              on_timeline_finish: resetTrialinBlockCounter
            });
            
            for (let i = 0; i < 3; i++) {
                timeline.push({
                    timeline: [dual_set_trial, createQuickBreakScreen()],
                    on_timeline_finish: incrementSegmentNumber
                });
            }
        }
        

          timeline.push(survey_screen);
          timeline.push(debrief_screen);
          timeline.push(closeFullScreen);

          console.log("Final Timeline: ", timeline);

          // Add the large timeline to the main timeline
          jsPsych.addNodeToEndOfTimeline({ timeline: timeline }, function() {});
      }
  };

    main_timeline.push(empty_trial);

    console.log("subjectID: ", subjectID);

    // Initialize and run the experiment
    jsPsych.run(main_timeline);



  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}