import { jsPsych } from "../jsp";
import psychophysics from "@kurokida/jspsych-psychophysics";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";
import { createColorWheel } from "../task-fun/createWheels"; 
import { Stimulus, CircleStimulus, WheelStimulus } from "../task-fun/createStimuli";
import { cloneDeep } from "lodash";
import { trialID, practiceTrialID, segmentID, blockID } from "./displayStimuli";
import { screenWidth } from "../task-fun/createGrid";

type StimulusType = 'colored_circle'; 

const stateManager = (function() {
    // Private state variables
    let filteredData: Stimulus[] = [];
    let currentStimulusToIdentify: CircleStimulus | null = null;
    let selectedStimulusTypeForRandomOrder: StimulusType | null = null;

    return {
        getFilteredData(): Stimulus[] {
            return filteredData;
        },
        setFilteredData(data: Stimulus[]): void {
            filteredData = data;
        },
        getCurrentStimulusToIdentify(): CircleStimulus | null {
            return currentStimulusToIdentify;
        },
        setCurrentStimulusToIdentify(stimulus: CircleStimulus | null): void {
            currentStimulusToIdentify = stimulus;
        },
        getSelectedStimulusTypeForRandomOrder(): StimulusType | null {
            return selectedStimulusTypeForRandomOrder;
        },
        setSelectedStimulusTypeForRandomOrder(type: StimulusType | null): void {
            selectedStimulusTypeForRandomOrder = type;
        },
        resetState(): void {
            filteredData = [];
            currentStimulusToIdentify = null;
            selectedStimulusTypeForRandomOrder = null;
        }
    };
})();

// Fetch previous trials based on the number and optional stimulusType
function fetchPreviousTrials(numTrials: number, stimulusType?: StimulusType | null) {
    const trials = jsPsych.data.get().last(numTrials).values();
    if (stimulusType) {
        return trials.filter(trial => trial.stimulusType === stimulusType);
    }
    return trials;
}

// Check if it's the first test screen by tracking test trials
function isFirstTestScreen() {
    const testTrials = jsPsych.data.get().filter({ isTestTrial: true });
    return testTrials.count() % 2 === 0;
}

function isCircleStimulus(stim: Stimulus): stim is CircleStimulus {
    return stim.obj_type === 'circle';
}
function isWheelStimulus(stim: Stimulus): stim is WheelStimulus {
    return stim.obj_type === 'manual' && stim.category === 'customWheel';
}

/**
 * Main function to select stimuli (now always 'colored_circle').
 * We keep logic for 'split' block that might use ABBA vs random,
 * but it simply returns colored circles, since there's no second stimulus type.
 */
function selectStimuli(stimulusType: StimulusType): Stimulus[] {
    const trialType = jsPsych.timelineVariable('trialType');
    // Because 'split' may still have recallOrder = 'ABBA' or 'random'
    let recallOrder: 'ABBA' | 'random' | undefined;

    if (trialType === 'split') {
        recallOrder = jsPsych.timelineVariable('recallOrder');
    }

    // Obtain the relevant stimuli data:
    let stimuliData: Stimulus[] = getStimuliData(trialType, recallOrder, stimulusType);

    if (!stimuliData || stimuliData.length === 0) {
        throw new Error("No stimuli available.");
    }

    // We only have colored circles, so the final selection is straightforward:
    const circleStimuliData = stimuliData.filter(isCircleStimulus);
    return selectColoredCircleStimuli(circleStimuliData);
}

/**
 * Helper function that fetches trial data depending on block type (combined or split)
 * and recallOrder if the block is 'split' (ABBA or random).
 */
function getStimuliData(
    trialType: 'combined' | 'split',
    recallOrder: 'ABBA' | 'random' | undefined,
    stimulusType: StimulusType
): Stimulus[] {
    let stimuliData: Stimulus[] = [];

    if (trialType === 'combined') {
        // Use only the previous trial’s stimuli if isFirstTestScreen(),
        // otherwise use stateManager’s stored data
        const previousTrial = fetchPreviousTrials(1)[0];
        stimuliData = isFirstTestScreen()
            ? cloneDeep(previousTrial.stimuliData)
            : stateManager.getFilteredData();
    } else if (trialType === 'split') {
        // Depending on whether trial is ABBA or random, fetch the relevant stimuli
        if (recallOrder === 'ABBA') {
            const indexOffset = isFirstTestScreen() ? 1 : 3;
            const previousTrial = fetchPreviousTrials(indexOffset)[0];
            stimuliData = cloneDeep(previousTrial.stimuliData);
        } else if (recallOrder === 'random') {
            const numTrials = isFirstTestScreen() ? 2 : 3;
            const recentTrials = fetchPreviousTrials(numTrials, stimulusType);
            const relevantTrial = recentTrials.find(trial => trial.stimulusType === stimulusType);
            stimuliData = relevantTrial ? cloneDeep(relevantTrial.stimuliData) : [];
        }
    } else {
        throw new Error(`Unknown trial type: ${trialType}`);
    }

    return stimuliData;
}

/**
 * Function to select a single circle to be reproduced
 */
function selectColoredCircleStimuli(stimuliData: CircleStimulus[]): CircleStimulus[] {
    const randomIndex = Math.floor(Math.random() * stimuliData.length);
    const selectedCircle = stimuliData[randomIndex];

    // Store the selected stimulus
    stateManager.setCurrentStimulusToIdentify(cloneDeep(selectedCircle));

    // Hide its color by setting it to grey
    const greyColor = 'hsl(0, 0%, 50%)';
    selectedCircle.line_color = greyColor;
    selectedCircle.fill_color = greyColor;

    // Remove that circle from the array
    stimuliData.splice(randomIndex, 1);
    stateManager.setFilteredData(cloneDeep(stimuliData));

    return [selectedCircle];
}

/**
 * ===================================
 *    The main reproduction trial
 * ===================================
 * 
 * Where we display the color wheel, let participants move the mouse, etc.
 * 
 */
export const test_trial = {
  type: psychophysics,
  stimuli: function() {
    let stimulusType: StimulusType = 'colored_circle';

    // Get the selected stimuli (just colored circles)
    const selectedStimuli = selectStimuli(stimulusType);

    // We still create a wheel. Check the circle’s radius:
    const circleStim = selectedStimuli.find(isCircleStimulus);
    if (!circleStim) {
      throw new Error("No circle stimulus found in selected stimuli");
    }
    const radius = circleStim.radius;
    const outerRadius = radius * 2.7;
    const innerRadius = outerRadius * 0.68;

    const centerX = circleStim.startX;
    const centerY = circleStim.startY;

    // Random offset for color wheel
    const offset = Math.floor(Math.random() * 360);

    // Return the color wheel plus the circle
    const colorWheel = createColorWheel(centerX, centerY, outerRadius, innerRadius, offset);
    return [colorWheel, circleStim];
  },

  data: function () {
    const practice = jsPsych.timelineVariable('practice');
    const trialType = jsPsych.timelineVariable('trialType');
    const numCircles = jsPsych.timelineVariable("numCircles");

    let recallOrder = null;
    if (trialType === "split") {
      recallOrder = jsPsych.timelineVariable('recallOrder');
    }

    return {
      segmentID: segmentID,
      practiceTrialID: practiceTrialID,
      trialID: trialID,
      blockID: blockID,
      practice: practice,
      recallOrder: recallOrder,
      trialType: trialType,
      numCircles: numCircles,
    };
  },

  background_color: "#FFFFFF",
  response_type: "mouse",

  mouse_move_func: function(event) {
    const currentTrial = jsPsych.getCurrentTrial();
    const stim_array = currentTrial.stim_array as Stimulus[];

    // Check for color wheel + circle
    const colored_circle = stim_array.find(isCircleStimulus);
    const colorWheel = stim_array.find(isWheelStimulus);

    if (!colorWheel) {
      throw new Error("Expected a color wheel stimulus");
    }
    if (!colored_circle) {
      throw new Error("Expected a circle stimulus");
    }

    const offset = colorWheel.offset;
    const circleX = colored_circle.startX;
    const circleY = colored_circle.startY;

    const dx = event.offsetX - circleX;
    const dy = event.offsetY - circleY;

    let angleRadians = Math.atan2(dy, dx);
    let angleDegrees = angleRadians * (180 / Math.PI);
    if (angleDegrees < 0) {
      angleDegrees += 360;
    }

    // Apply the wheel offset
    angleDegrees = (angleDegrees + offset) % 360;

    // Convert angle to HSL
    const hue = angleDegrees;
    const color = `hsl(${hue}, 80%, 50%)`;

    colored_circle.fill_color = color;
    colored_circle.line_color = color;
  },

  on_start: function(trial) {
    // Merge new fields into trial.data
    Object.assign(trial.data, {
      stimulusToIdentify: stateManager.getCurrentStimulusToIdentify(),
      isTestTrial: true
    });
  },

  on_finish: function (data) {
    const stimuli_array = jsPsych.getCurrentTrial().stim_array as Stimulus[];

    // Remove the wheel from the final data
    const filteredStimuli = stimuli_array.filter(stim => stim.category !== 'customWheel');

    // Identify which side it was on, if relevant:
    const circleObject = filteredStimuli.find(isCircleStimulus);
    if (circleObject) {
      const midpoint = screenWidth / 2;
      const side = circleObject.startX < midpoint ? 'left' : 'right';
      data.side = side;
    }

    // Map the stimuli onto your predefined structure
    const processedStimuli = filterAndMapStimuli(filteredStimuli);
    data.selectedStimuli = processedStimuli;

    // All stimuli are "colored_circle" now
    data.stimulusType = 'colored_circle';

    // In this part of the code, when we calculate isFirstTestScreen() again, it actually returns false, even though it is the first test screen. 
    // This is why we reset the stateManager like this, even though it seems we are resetting it during the first test screen, when actually
    // it is the second test screen. None of the other functions are affected by this, not even post_trial_gap.
    if (isFirstTestScreen()) {
      data.recallPosition = 2;
    } else {
      data.recallPosition = 1;
    }

      // If it's a split trial, label as 'A' or 'B'
     if (data.trialType === 'split') {
    data.AorBatRetrieval = (data.side === 'left') ? 'A' : 'B';
    }
    // If it’s the first test screen (meaning its actually the second), we reset the state
    if (isFirstTestScreen()) {
      stateManager.resetState();
    }
  },

  // For demonstration, 100 ms gap on first test screen, 1000 ms otherwise
  post_trial_gap: function() {
    return isFirstTestScreen() ? 100 : 1000;
  }
};
