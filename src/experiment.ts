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
  interface TrialObject {
    type: typeof psychophysics;
    stimuli: any[];
    choices: string[];
    response_ends_trial: boolean;
    trial_duration: number;
  }
  
  const experimentTrials: {
    timeline: TrialObject[];
    repetitions: number;
  } = {
    timeline: [],
    repetitions: 1,
  };
  
  for (const itemType of expInfo.DESIGN.itemTypes as ("dot" | "clock")[]) {
    for (const condition of expInfo.DESIGN.conditions) {
      for (let i = 0; i < expInfo.DESIGN.nTrialsPerCondition; i++) {
        experimentTrials.timeline.push({
          type: psychophysics,
          stimuli: createNewTrial(condition, itemType),
          choices: expInfo.KEYS.CONTINUE,
          response_ends_trial: true,
          trial_duration: condition * 100,
        });
      }
    }
  }
  
  
  // Randomize the order of the trials
  experimentTrials.timeline = [...experimentTrials.timeline].sort(() => Math.random() - 0.5);
 
  /************************************** Procedure **************************************/


  // Push all the screen slides into timeline
  // When you want to test the experiment, you can easily comment out the screens you don't want
  timeline.push(preload_screen);
  timeline.push(welcome_screen);
  timeline.push(consent_screen);
  timeline.push(notice_screen);
  timeline.push(browser_screen);
  timeline.push(experimentTrials);


  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}
