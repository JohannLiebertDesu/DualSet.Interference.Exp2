import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';

// Function to get Dual Set Warning with text style
export const getDualSetWarning = (blockType) => {
  if (blockType === 'random') {
      return {
          type: jsPsychHtmlButtonResponse,
          stimulus: '<div style="font-family: \'Aptos\', sans-serif; font-size: 23px; color: black; margin-bottom: 100px;">In the following block, you will always first see 3 items of one kind on the left, then 3 of the other kind on the right, with a slight delay. You will have to reproduce the color/orientation of one item of each kind, chosen at random.<br><br>Click on “Continue” to begin with the practice trials.</div>',
          choices: ['Continue']
      };
  } else {
      return {
          type: jsPsychHtmlButtonResponse,
          stimulus: '<div style="font-family: \'Aptos\', sans-serif; font-size: 23px; color: black; margin-bottom: 100px;">In the following block, you will always first see 3 items of one kind on the left, then 3 of the other kind on the right, with a slight delay. You will have to reproduce the color/orientation of one item of each kind, first on the right, then on the left.<br><br>Click on “Continue” to begin with the practice trials.</div>',
          choices: ['Continue']
      };
  }
};

// Single Set Warning with text style
export const singleSetWarning = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<div style="font-family: \'Aptos\', sans-serif; font-size: 23px; color: black; margin-bottom: 100px;">In the following block, you will be seeing either 3 or 6 items presented at once, but they will always be of the same kind (colored discs or line orientations). You will have to remember two per trial, chosen at random.<br><br>Click on “Continue” to begin with the practice trials.</div>',
  choices: ['Continue']
};
