/**
 * This file contains the settings for the experiment.
 */



import { subjectID } from './participantCounterbalancing';
import { setCSS } from './task-fun/setCSS';
setCSS();

function assignParticipantGroup(id) {
  const groups = ['colorFirst', 'orientationFirst'];
  const blockTypes = ['random', 'systematic'];
  const blockOrders = ['dualSetFirst', 'singleSetFirst'];

  // Define the type for combinations
  type Combination = {
    group: string;
    blockType: string;
    blockOrder: string;
  };

  // Generate all possible combinations of groups, block types, and block orders
  const combinations: Combination[] = [];
  for (const group of groups) {
    for (const blockType of blockTypes) {
      for (const blockOrder of blockOrders) {
        combinations.push({ group, blockType, blockOrder });
      }
    }
  }


  // Assign based on participant ID using modulo to loop through combinations
  const combination = combinations[(id - 1) % combinations.length];

  return combination;
}

const { group: participantGroup, blockType: participantBlockType, blockOrder: participantBlockOrder } = assignParticipantGroup(subjectID);

export const expInfo = {
  // settings for the experiment
  TITLE: "DualSet.Interference.Exp1",
  LANG: "en", // the default language of the experiment

  DESIGN: {
    participantGroup: participantGroup,
    participantBlockType: participantBlockType,
    participantBlockOrder: participantBlockOrder,
    nBlocks: 1, // number of blocks
    nTrialsPerBlock: 4, // number of total trials in a block
    itemTypes: ["dot", "clock"],
    setSize: [3, 6],
    get nTrialsPerCondition() {
      return this.nTrialsPerBlock / this.setSize.length / this.itemTypes.length;
    }, // number of experiment trials for each condition
    DualSet: false,
    OrientationGroup: false,
  },
  
  // settings for each trial
  TIMING: {
    EncodingDurations: {
      short: 1000,
      medium: 2000,
      long: 2300,
    },
  },

  // when using Prolific, you can set customized completion codes for different situations
  // e.g., when participants complete the experiment, or when they fail the attention check
  // you can set them here and use them in the end of the experiment (jsp.ts)
  CODES: {
    SUCCESS: "success", // the code for a successfully completion of the experiment
    FAIL: "fail", // the code for the failed experiment
    // You can specify the codes for different situations here.
  },
  
  /** The key is case-sensitive and position-sensitive.
   * It is recommended to allow both upper and lower case keys.
   * You can use the `convertCase` function to prevent the issue.
   * Be cautious, the names of the number keys on the top of the keyboard
   * are different from those on the right side of the keyboard.
   */
  KEYS: {
    CONTINUE: ["enter"],
    START_TRIAL: [" "],
  },

  // If you want to use the keyCode rather than key name,
  // you can go to the following link to get the key code:
  // https://www.toptal.com/developers/keycode/

  // Running environment variables
  RUN_JATOS: false, // a switch to run the experiment on JATOS
};

// Global variables for the system. Normally, you don't need to change them.
export const varSystem = {
  TRACK: false, // a switch to track participants' interactions with the browser
  nBLUR: 0, // use to count how many times participants left the browser
  MAX_BLUR: 3, // the maximum number of times participants can leave the browser
  LOOP: true, // a switch to control whether participants need to read the instruction and practice again
  RUN_TIMER: false, // a switch to control the countdown timer
  FAILED_ATTENTION_CHECK: false,
};
