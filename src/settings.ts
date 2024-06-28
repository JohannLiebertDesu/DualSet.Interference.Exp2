/**
 * This file contains the settings for the experiment.
 */
import { setCSS } from './task-fun/setCSS';
setCSS();

export const counters = {
  blockNumber: 1,
  trialNumberOverall: 1,
  trialNumberThisBlock: 1,
  segmentNumber: 1
};

// Function to assign participant to a group based on their ID
export function assignParticipantGroup(id: number): Combination {
  const groups = ['colorFirst', 'orientationFirst'];
  const blockTypes = ['random', 'systematic'];
  const blockOrders = ['dualSetFirst', 'singleSetFirst'];

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

// Define the Combination type
type Combination = {
  group: string;
  blockType: string;
  blockOrder: string;
};

// Define the DESIGN type
type Design = {
  participantGroup: string | null;
  participantBlockType: string | null;
  participantBlockOrder: string | null;
};

// Export the DESIGN object with initial null values
export let DESIGN: Design = {
  participantGroup: null,
  participantBlockType: null,
  participantBlockOrder: null,
};

export const expInfo = {
  // settings for the experiment
  TITLE: "DualSet.Interference.Exp1",
  LANG: "en", // the default language of the experiment

  // when using Prolific, you can set customized completion codes for different situations
  // e.g., when participants complete the experiment, or when they fail the attention check
  // you can set them here and use them in the end of the experiment (jsp.ts)
  CODES: {
    SUCCESS: "C1IEJ2YE", // the code for a successfully completion of the experiment
    OFFLINE: "C1JZ9NKH", // the code for the offline situation
    FAILED_ATTENTION: "CGHTN2LG", // the code for the failed experiment
    FAILED_OTHERS: "CCWBM3SE", // the code for other failed situations (e.g., failed to resize the window)
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
  STATUS: "success", // the status of the experiment
};
