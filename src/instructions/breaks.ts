import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';

// The break slides for the two blocks
export const breakOne = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<div style="font-family: \'Aptos\', sans-serif; font-size: 23px; color: black; margin-bottom: 100px;">Very nice, you have now completed the first third of this block. Take a few seconds to rest your mind.<br><br>Click on “Continue” when you are ready to continue with the trials.</div>',
    choices: ['Continue']
};

export const breakTwo = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<div style="font-family: \'Aptos\', sans-serif; font-size: 23px; color: black; margin-bottom: 100px;">Excellent, you have now completed the second third of this block. Take a few seconds to rest your mind.<br><br>Click on “Continue” when you are ready to continue with the trials.</div>',
    choices: ['Continue']
  };
  