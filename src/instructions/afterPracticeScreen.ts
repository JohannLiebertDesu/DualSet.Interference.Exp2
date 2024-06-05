import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';

// Single Set Warning with text style
export const practiceOver = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<div style="font-family: \'Aptos\', sans-serif; font-size: 23px; color: black; margin-bottom: 100px;">Great, these were the practice trials.<br><br>Click on “Continue” when you feel ready to begin with the real trials.</div>',
    choices: ['Continue']
  };