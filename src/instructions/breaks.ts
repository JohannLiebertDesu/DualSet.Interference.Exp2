import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { counters } from '../settings';

export function createQuickBreakScreen() {
  let message = '';
  let buttonText = '';

  switch (counters.segmentNumber) {
    case 1:
      message = "Very nice, you have now completed the first third of this block. Take a few seconds to rest your mind.<br><br>Click on 'Continue' when you are ready to continue with the trials.";
      buttonText = 'Continue';
      break;
    case 2:
      message = "Excellent, you have now completed the second third of this block. Take a few seconds to rest your mind.<br><br>Click on 'Continue' when you are ready to continue with the trials.";
      buttonText = 'Continue';
      break;
    case 3:
      message = "Great, you have now finished this block!<br><br>Click on 'Continue' to move on to the next part of the experiment.";
      buttonText = 'Continue';
      break;
    default:
      message = "You've reached a quick break. Click 'Continue' to proceed.";
      buttonText = 'Continue';
      break;
  }

  const quickBreakScreen = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div style="font-family: 'Aptos', sans-serif; font-size: 23px; color: black; margin-bottom: 100px">${message}</div>`,
    choices: [buttonText],
    margin_vertical: '80px'
  };

  return quickBreakScreen;
}
