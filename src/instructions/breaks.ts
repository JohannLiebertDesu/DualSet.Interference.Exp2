import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { counters } from '../settings';

export function createQuickBreakScreen() {
  const quickBreakScreen = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '',
    choices: ['Continue'],
    margin_vertical: '80px',
    on_start: function(trial) {
      let message = '';

      switch (counters.segmentNumber) {
        case 1:
          message = "Very nice, you have now completed the first third of this block. Take a few seconds to rest your mind.<br><br>Click on “Continue” when you are ready to continue with the trials.";
          break;
        case 2:
          message = "Excellent, you have now completed the second third of this block. Take a few seconds to rest your mind.<br><br>Click on “Continue” when you are ready to continue with the trials.";
          break;
        case 3:
          message = "Great, you have now finished this block!<br><br>Click on “Continue” to move on to the next part of the experiment.";
          break;
        default:
          message = "You've reached a quick break. Click “Continue” to proceed.";
          break;
      }

      trial.stimulus = `<div style="font-family: 'Aptos', sans-serif; font-size: 23px; color: black; margin-bottom: 100px">${message}</div>`;
    }
  };

  return quickBreakScreen;
}
