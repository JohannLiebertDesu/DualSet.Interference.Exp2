/**
 * @title DualSet Interference Exp2
 * @description Inspecting the impact of a random vs an ABBA testing sequence on dual-set interference in WM
 * @author Noah Rischert, Chenyu Li and Hannah (Dames) Tschannen
 * @version 0.1
 *
 *
 * @assets assets/
 */

// import stylesheets (.scss or .css).
import "../styles/main.scss";

// jsPsych official plugin
import preload from "@jspsych/plugin-preload";

// Global variables
import { jsPsych } from "./jsp";

// screens
import { welcome_screen } from "./instructions/welcome";
import { consent_screen, notice_screen } from "./instructions/consent";
import { browser_screen } from "./instructions/browserCheck";
import { fullMode_screen, closeFullScreen } from "./instructions/fullScreen";
import { assembleExperiment, conditions } from "./timelineVariables";
import { initializeAndAssignSubjectID } from "./task-fun/participantID";
import { survey_screen } from "./ending/questionnaire";
import { debrief_screen } from "./ending/debriefing";
import { instructionSlidesConfig } from "./instructions/InstrStart";
import jsPsychCallFunction from '@jspsych/plugin-call-function';

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
  const preloadSlides = {
    type: preload,
    max_load_time: 1000,
    images: [
      "assets/instructionImages/Slide1.gif",
      "assets/instructionImages/Slide2.gif",
      "assets/instructionImages/Slide3.gif",
      "assets/instructionImages/Slide4.gif",
      "assets/instructionImages/Slide5.gif",
    ]
  };

  /************************************** Procedure **************************************/

  // Push all the screen slides into timeline
  // When you want to test the experiment, you can easily comment out the screens you don't want
  timeline.push(preloadSlides);
  timeline.push(welcome_screen);
  timeline.push(consent_screen);
  timeline.push(notice_screen);
  timeline.push(browser_screen);
  timeline.push(fullMode_screen);

  // Make sure the code executing this is in an async function/context
  const subject_id = await initializeAndAssignSubjectID();

  // Calculate the condition index based on participant ID
  const conditionIndex = subject_id % conditions.length; // In our case, if for example 13 % 8, then conditionIndex is 5, which selects the sixth position in the array (since we start at 0)
  const condition = conditions[conditionIndex]; // From the condition array, position 5 would get selected as the relevant condition for this participant

  // The variable "condition" could then look like this:
  // {
  //   name: "ColoredFirst_PureFirst_ABBA",
  //   params: {
  //     firstStimulusInMixed: StimulusType.ColoredCircle,
  //     trialOrder: TrialOrder.PureFirst,
  //     recallOrderInMixed: RecallOrderInMixed.ABBA,
  //   },
  // }

  // We use the selected condition, and its contained parameters to assemble the experiment.
  const participantExperiment = assembleExperiment(condition.params);

  // Make sure the code executing this is in an async way, as the jatos is too slow to have the function execute all at once.
  // The reason why i assign a participant id so late is simply because we don't need it before that and otherwise participants might join the experiment, get an id assigned and then not actually complete anything.
  timeline.push({
    type: jsPsychCallFunction,
    async func() {
      const subject_id = await initializeAndAssignSubjectID();
      jsPsych.data.addProperties({
        subject: subject_id,
        experiment: "experiment2"
      });
    },
  });

  console.log("subject_id", subject_id);
    timeline.push(instructionSlidesConfig);
    timeline.push(participantExperiment);
    timeline.push(survey_screen);
    timeline.push(debrief_screen);
    timeline.push(closeFullScreen);
    await jsPsych.run(timeline);
  }
