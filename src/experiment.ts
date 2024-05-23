/**
 * @title DualSet.Interference.Exp1
 * @description Systematically varying the combination possibilities and numbers of 2 sets that need to be memorized, including color patches and orientations. Variations include screen side, mixing or separating the qualitatively different items. Each trial concludes with the reproduction of 2 items.
 * @author Chenyu Li, chatGPT and Noah Rischert
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
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

// Global variables
import { jsPsych } from "./jsp";
import { expInfo } from "./settings";
import { random } from "@coglabuzh/webpsy.js";

// screens
import { welcome_screen } from "./instructions/welcome";
import { consent_screen, notice_screen } from "./instructions/consent";
import { browser_screen } from "./instructions/browserCheck";
import { fullMode_screen } from "./instructions/fullScreen";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, numColumns, numRows, createGrid, calculateCellSize, placeAndGenerateStimuli, resetGrid, closeFullScreen } from "./gridAndStimuli";

// Trial screens preparation
import { blankScreenStageOne, blankScreenStageTwo, blankScreenStageThree, createColorWheelStage, createOrientationWheelStage } from './trialScreensPreparation';


import { create } from "domain";


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

    /************************************** Block 1 **************************************/

    const displayStimuliSingleSet = {
        type: psychophysics,
        stimuli: function () {
          const numCircles = jsPsych.timelineVariable('numCircles');
          const stimulusType = jsPsych.timelineVariable('stimulusType');
          const side = numCircles === 3 ? 'left' : 'both';
          console.log('Generating stimuli with numCircles:', numCircles, 'Side:', side, 'Stimulus Type:', stimulusType);
          const stimuli = placeAndGenerateStimuli(grid, numCircles, cellWidth, cellHeight, side, stimulusType);
          console.log('Generated Stimuli:', stimuli);
          jsPsych.data.write({ key: 'stimuli', value: stimuli });
          jsPsych.data.write({ key: 'stimulusType', value: stimulusType }); // Save stimulus type for later
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
            function (data) {
              console.log('Display First Color Wheel finished');
            }
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
            function (data) {
              console.log('Display First Orientation Wheel finished');
            }
          )
        ],
        conditional_function: shouldDisplayOrientationWheel
      };
      
      const single_set_trial = {
        timeline: [
          displayStimuliSingleSet,
          blankScreenStageOne,
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
                  console.log('Display Second Color Wheel finished');
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
                  console.log('Display Second Orientation Wheel finished');
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
        sample: {
          type: 'fixed-repetitions',
          size: 1
        }
      };
      
            
    /************************************** Block 2 **************************************/

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
            show_end_time: 1000
          }));
      
          const blankScreen = {
            obj_type: 'text',
            content: '', // Blank screen
            show_start_time: 1000, // Start after the first stimuli
            show_end_time: 3000 // End after 2000ms blank screen
          };
      
          const secondStimuliWithTiming = secondStimuli.map(stim => ({
            ...stim,
            show_start_time: 3000,
            show_end_time: 4000
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
        trial_duration: 4000, // Total duration: 1000ms (first stimuli) + 2000ms (blank) + 1000ms (second stimuli)
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
      
      // Define the dual set trial
      const dual_set_trial = {
        timeline: [
          displayStimuliDualSet,
          blankScreenStageOne,
          systematicTimeline,
          randomTimeline,
          blankScreenStageThree // Include blankScreenStageThree at the end
        ],
        timeline_variables: [
          { randomStimulusType: 'circle' },
          { randomStimulusType: 'circle_with_line' }
        ],
        sample: {
          type: 'fixed-repetitions',
          size: 2
        }
      };
            
            
      
    /************************************** Procedure **************************************/


    //   timeline.push(preload_screen);
    //   timeline.push(welcome_screen);
    //   timeline.push(consent_screen);
    //   timeline.push(notice_screen);
    timeline.push(fullMode_screen);
    //   timeline.push(browser_screen);
    if (expInfo.DESIGN.participantBlockOrder === 'dualSetFirst') {
        timeline.push(dual_set_trial);
        timeline.push(single_set_trial);
      } else {
        timeline.push(single_set_trial);
        timeline.push(dual_set_trial);
      }

    timeline.push(closeFullScreen);
    console.log('Timeline built', timeline);
    jsPsych.run(timeline);

    
  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}