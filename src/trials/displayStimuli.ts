import psychophysics from "@kurokida/jspsych-psychophysics";
import { placeAndGenerateStimuli } from "../task-fun/placeStimuli";
import {
  createGrid,
  numColumns,
  numRows,
  cellSize,
  resetGrid,
} from "../task-fun/createGrid";
import { jsPsych } from "../jsp";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";

// Constants
const BLOCK_SIZE = 96; // Number of trials per block
const SEGMENT_SIZE = 32; // Number of trials per segment
const GRID = createGrid(numColumns, numRows);

export let practiceTrialID = 0;
export let trialID = 0;

export const displayStimuli = {
  type: psychophysics,
  stimuli: function () {
    // Now we only have a single stimulusType => colored circles
    // Still read numCircles from timeline variable
    const numCircles = jsPsych.timelineVariable("numCircles");
    const { side, stimulusType } = computeTrialVariables();

    const generatedStimuli = placeAndGenerateStimuli(
      GRID,
      numCircles,
      cellSize.cellWidth,
      cellSize.cellHeight,
      side,
      stimulusType
    );

    return generatedStimuli;
  },

  data: function () {
    const { side, stimulusType } = computeTrialVariables();
    const trialType = jsPsych.timelineVariable("trialType");
    const practice = jsPsych.timelineVariable("practice");
    let recallOrder = null;

    // Keep recallOrder for split block if used
    if (trialType === "split") {
      recallOrder = jsPsych.timelineVariable("recallOrder");
    }

    // Increments for practice vs. main trials
    if (practice) {
      if (trialType === "combined") {
        practiceTrialID++;
      } else if (trialType === "split" && isFirstPresentation()) {
        practiceTrialID++;
      }
    } else {
      if (trialType === "combined") {
        trialID++;
      } else if (trialType === "split" && isFirstPresentation()) {
        trialID++;
      }
    }

    console.log("is first presentation", isFirstPresentation());

    console.log("Trial ID", trialID);
    console.log("Practice Trial ID", practiceTrialID);
    
    return {
      segmentID: Math.floor(trialID / SEGMENT_SIZE), // Corrected formula
      practiceTrialID: practiceTrialID,
      trialID: trialID,
      blockID: Math.floor(trialID / BLOCK_SIZE), // Corrected formula
      numCircles: jsPsych.timelineVariable("numCircles"),
      side: side,
      stimulusType: stimulusType,
      trialType: trialType,
      recallOrder: recallOrder,
      practice: practice,
      isTestTrial: false,
      presentationOrder: isFirstPresentation() ? "A" : "B",
    };
  },

  background_color: "#FFFFFF",
  choices: "NO_KEYS",

  trial_duration: function () {
    return jsPsych.timelineVariable("numCircles") * 100;
  },

  on_finish: function (data) {
    // Filter and attach stimuli data
    const stimuli_array = jsPsych.getCurrentTrial().stim_array;
    const filteredStimuli = filterAndMapStimuli(stimuli_array);
    data.stimuliData = filteredStimuli;

    // Reset the grid for next trial
    resetGrid(GRID, numColumns, numRows);
  },

  post_trial_gap: function () {
    const trialType = jsPsych.timelineVariable("trialType");

    if (trialType === "combined") {
      // We rely on timelineVariable("post_trial_gap") for combined block
      return jsPsych.timelineVariable("post_trial_gap");
    } else {
      // For the split block, default to 1000 ms
      return 1000;
    }
  },
};


function computeTrialVariables() {
  const trialType = jsPsych.timelineVariable("trialType");
  let side;
  let stimulusType;

  if (trialType === "combined") {
    // "combined" block => 3 or 6 circles, side often "both", or your chosen logic
    side = jsPsych.timelineVariable("side"); // e.g., "both"
    stimulusType = jsPsych.timelineVariable("stimulusType"); // "colored_circle"
  } else {
    // "split" block => left side if first presentation, right if second
    if (isFirstPresentation()) {
      side = "left";
    } else {
      side = "right";
    }

    stimulusType = jsPsych.timelineVariable("stimulusType");
  }

  return { side, stimulusType };
}

function isFirstPresentation() {
  const splitTrialCount = jsPsych.data.get().filter({ trialType: "split" }).count();
  // If count is even => it's the next "first" presentation
  // If count is odd => it's the "second" presentation
  return splitTrialCount % 2 === 0;
}
