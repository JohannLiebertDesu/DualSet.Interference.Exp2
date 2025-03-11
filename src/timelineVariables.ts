// Import necessary modules and plugins
import { displayStimuli } from './trials/displayStimuli';
import { test_trial } from './trials/reproductionTrial';
import { TEXT } from './task-fun/text';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';

/**
 * ====================================
 *    GLOBAL CONSTANTS & ENUMS
 * ====================================
 */
const gapAfterBreakScreens = 1000; // The gap after any break screen in ms

// Only one type of stimulus is now used in the experiment
enum StimulusType {
  ColoredCircle = 'colored_circle',
}

// Order in which blocks can be presented
enum TrialOrder {
  CombinedFirst = 'CombinedFirst',
  SplitFirst = 'SplitFirst',
}

// The order of recall in the split block
enum RecallOrderInSplit {
  Random = 'random',
  ABBA = 'ABBA',
}

// For your convenience, you can keep these or rename them
enum PostTrialGaps {
  Long = 2300,  // e.g., used for 3 circles in the combined block
  Short = 2000, // e.g., used for 6 circles in the combined block
}

/**
 * ====================================
 *    INTERFACES FOR TRIAL STRUCTURE
 * ====================================
 */
interface Trial {
  type: string | Function;
  stimulus?: string;
  choices?: string | string[];
  [key: string]: any;
}

// Variables specific to the combined block
interface CombinedTimelineVariable {
  numCircles: number;      // Either 3 or 6
  side: string;            // e.g. 'both' for combined
  stimulusType: StimulusType;
  post_trial_gap: number;  // 2300 or 2000 ms
  trialType: 'combined';
  practice: boolean;
}

// Variables specific to the split block
interface SplitTimelineVariable {
  stimulusType: StimulusType; 
  trialType: 'split';
  recallOrder: RecallOrderInSplit; 
  numCircles: number;      // 3 (left), then 3 (right)
  practice: boolean;
}

// A procedure with a timeline and variables
interface Procedure {
  timeline: Trial[];
  timeline_variables: CombinedTimelineVariable[] | SplitTimelineVariable[];
  sample: {
    type: string;
    size: number;
  };
  procedureType: 'combined' | 'split';
}

// The entire experiment structure
interface Experiment {
  name: string;
  timeline: (Procedure | Trial)[];
}

// The condition parameters for the new design
interface ConditionParams {
  trialOrder: TrialOrder;           // Which block is first
  recallOrderInSplit: RecallOrderInSplit;  // ABBA vs. random
}

/**
 * ====================================
 *    HELPER FUNCTIONS
 * ====================================
 */

/**
 * Creates a break screen trial with a standard "Continue" button.
 */
function createBreakScreen(
  breakType: 'postPractice' | 'betweenTrials' | 'betweenBlocks',
  loopValue: number | null,
  blocksCreated: number | null,
  repetitions: number | null
): Trial {
  return {
    type: htmlButtonResponse,
    stimulus: TEXT.blockBreak(breakType, loopValue, blocksCreated, repetitions),
    choices: ['Continue'],
    post_trial_gap: gapAfterBreakScreens,
  };
}

/**
 * Creates a simple information screen to announce a new block.
 * We no longer need to mention multiple stimuli, just whether
 * the block is “combined” or “split.”
 */
function createUpcomingBlockInformationScreen(
  blockType: 'combined' | 'split',
  recallOrder: RecallOrderInSplit | null,
  trialOrder: TrialOrder,
  blockNumber: number
): Trial {
  // Adjust the text inside TEXT.blockInfo to match your new design
  return {
    type: htmlButtonResponse,
    stimulus: TEXT.blockInfo(blockType, recallOrder, trialOrder, blockNumber),
    choices: ['Continue'],
    post_trial_gap: gapAfterBreakScreens,
  };
}

/**
 * ====================================
 *    TIMELINE VARIABLE CREATION
 * ====================================
 */

/**
 * Combined block variables:
 * - 3 circles => 2300 ms gap
 * - 6 circles => 2000 ms gap
 */
function createCombinedTimelineVariables(
  practice: boolean
): CombinedTimelineVariable[] {
  return [
    {
      numCircles: 3,
      side: 'left',
      stimulusType: StimulusType.ColoredCircle,
      post_trial_gap: PostTrialGaps.Long,  // 2300 ms
      trialType: 'combined',
      practice,
    },
    {
      numCircles: 6,
      side: 'both',
      stimulusType: StimulusType.ColoredCircle,
      post_trial_gap: PostTrialGaps.Short, // 2000 ms
      trialType: 'combined',
      practice,
    },
  ];
}

/**
 * Split block variables:
 * We always show 3 circles on the left, then 3 on the right.
 * Keep the recallOrder in case your code still uses ABBA vs random logic.
 */
function createSplitTimelineVariables(
  recallOrder: RecallOrderInSplit,
  practice: boolean
): SplitTimelineVariable[] {
  // You can define multiple objects if you want separate "left" and "right" logic,
  // or keep it simpler if your trial code handles that automatically.
  return [
    {
      stimulusType: StimulusType.ColoredCircle,
      trialType: 'split',
      recallOrder,
      numCircles: 3,
      practice,
    },
  ];
}

/**
 * ====================================
 *    PROCEDURE CREATION
 * ====================================
 */

/**
 * Combined Stimuli Procedure:
 * For each timeline variable, we'll show the stimuli once, then test.
 * You can keep or modify how many times test_trial appears in the sequence.
 */
function createCombinedStimuliProcedure(
  timelineVariables: CombinedTimelineVariable[],
  practice: boolean
): Procedure {
  return {
    timeline: [displayStimuli, test_trial, test_trial],
    timeline_variables: timelineVariables,
    sample: {
      type: 'fixed-repetitions',
      // Adjust the number of repetitions as you see fit, in this case its #timelineVariables (2) * sample size (16) * repetitions (3) = 96 (32 per timelineVariable)
      size: practice ? 6 : 16,
    },
    procedureType: 'combined',
  };
}

/**
 * Split Stimuli Procedure:
 * Typically shows the left set, then the right set, then test.
 * The old code had two presentations before test – you can adapt as needed.
 */
function createSplitStimuliProcedure(
  timelineVariables: SplitTimelineVariable[],
  practice: boolean
): Procedure {
  return {
    timeline: [displayStimuli, displayStimuli, test_trial, test_trial],
    timeline_variables: timelineVariables,
    sample: {
      type: 'fixed-repetitions',
      // Adjust the number of repetitions as you see fit, in this case its timelineVariables (1) * sample size (32) * repetitions (3) = 96 (32 per timelineVariable)
      size: practice ? 12 : 32,
    },
    procedureType: 'split',
  };
}

/**
 * ====================================
 *    BLOCK CREATION FUNCTION
 * ====================================
 * 
 * This function creates one block (e.g., combined or split),
 * inserting practice trials, short breaks, etc.
 */
function createBlock(
  mainProcedure: Procedure,
  practiceProcedure: Procedure,
  repetitions: number,
  recallOrderInSplit: RecallOrderInSplit,
  trialOrder: TrialOrder
): (Procedure | Trial)[] {
  const block: (Procedure | Trial)[] = [];

  // Figure out if this is the first or second block
  // (BlockNr = 1 for the block that matches trialOrder, else 2)
  // Because we have only two block types: 'combined' and 'split'.
  const blockNumber =
    (trialOrder === TrialOrder.CombinedFirst && mainProcedure.procedureType === 'combined') ||
    (trialOrder === TrialOrder.SplitFirst && mainProcedure.procedureType === 'split')
      ? 1
      : 2;

  // Show a screen announcing what block is coming up
  const upcomingBlockInformationScreen = createUpcomingBlockInformationScreen(
    mainProcedure.procedureType,
    mainProcedure.procedureType === 'split' ? recallOrderInSplit : null,
    trialOrder,
    blockNumber
  );
  block.push(upcomingBlockInformationScreen);

  // Add the practice procedure
  block.push(practiceProcedure);

  // Break after practice
  let postPracticeBreakTrial = createBreakScreen('postPractice', null, null, null);
  block.push(postPracticeBreakTrial);

  // The main procedure repeated 'repetitions' times
  for (let i = 0; i < repetitions; i++) {
    block.push(mainProcedure);

    // Add a short break after each repetition except the last
    if (i < repetitions - 1) {
      let shortBreakTrial = createBreakScreen('betweenTrials', i + 1, blockNumber, repetitions);
      block.push(shortBreakTrial);
    }
  }

  return block;
}

/**
 * ====================================
 *    MAIN EXPERIMENT ASSEMBLY
 * ====================================
 * 
 * In the new experiment, you have two blocks: 
 *  - Combined
 *  - Split
 * You can choose which block is first (CombinedFirst or SplitFirst), 
 * and whether the split block has ABBA or random ordering. 
 */
export function assembleExperiment(params: ConditionParams): Experiment {
  const { trialOrder, recallOrderInSplit } = params;

  // 1) Create practice and main procedures for combined block
  const combinedPracticeProcedure = createCombinedStimuliProcedure(
    createCombinedTimelineVariables(true),
    true
  );
  const combinedMainProcedure = createCombinedStimuliProcedure(
    createCombinedTimelineVariables(false),
    false
  );

  // 2) Create practice and main procedures for split block
  const splitPracticeProcedure = createSplitStimuliProcedure(
    createSplitTimelineVariables(recallOrderInSplit, true),
    true
  );
  const splitMainProcedure = createSplitStimuliProcedure(
    createSplitTimelineVariables(recallOrderInSplit, false),
    false
  );

  // 3) Assemble both blocks
  const combinedBlock = createBlock(
    combinedMainProcedure,
    combinedPracticeProcedure,
    1, // number of repetitions for the combined block
    recallOrderInSplit,
    trialOrder
  );

  const splitBlock = createBlock(
    splitMainProcedure,
    splitPracticeProcedure,
    1, // number of repetitions for the split block
    recallOrderInSplit,
    trialOrder
  );

  // 4) Large break between blocks
  const largeBreakTrial = createBreakScreen('betweenBlocks', null, null, null);

  // 5) Final timeline depends on whether Combined or Split is first
  let experimentTimeline: (Procedure | Trial)[];
  if (trialOrder === TrialOrder.CombinedFirst) {
    experimentTimeline = [...combinedBlock, largeBreakTrial, ...splitBlock];
  } else {
    experimentTimeline = [...splitBlock, largeBreakTrial, ...combinedBlock];
  }

  // Return the complete experiment
  return {
    name: 'Experiment_' + trialOrder, 
    timeline: experimentTimeline,
  };
}

/**
 * ====================================
 *    CONDITION GENERATION (OPTIONAL)
 * ====================================
 * 
 * If your code still needs to generate all possible conditions (e.g., for ABBA vs random),
 * you can keep something like:
 */

// Possible order of blocks
export const trialOrderOptions: TrialOrder[] = [
  TrialOrder.CombinedFirst,
  TrialOrder.SplitFirst,
];

// Possible recall orders for the split block
export const recallOrderOptions: RecallOrderInSplit[] = [
  RecallOrderInSplit.Random,
  RecallOrderInSplit.ABBA,
];

export function generateConditionCombinations(): { 
  name: string; 
  params: ConditionParams; 
}[] {
  const conditions: { name: string; params: ConditionParams }[] = [];
  
  trialOrderOptions.forEach((tOrder) => {
    recallOrderOptions.forEach((rOrder) => {
      const conditionName = `${tOrder}_${rOrder}`;
      conditions.push({
        name: conditionName,
        params: {
          trialOrder: tOrder,
          recallOrderInSplit: rOrder,
        },
      });
    });
  });

  return conditions;
}

export const conditions = generateConditionCombinations();

console.log("printing the conditions:", conditions); // For testing purposes