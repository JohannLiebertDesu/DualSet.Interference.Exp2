import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';

export const getDualSetWarning = (blockType) => {
  if (blockType === 'random') {
      return {
          type: jsPsychHtmlButtonResponse,
          stimulus: 'The following block is going to be the one where you see 3 circles of the one kind on the left, then 3 of the other kind on the right. You will be tested on one circle of each, in a random order.',
          choices: ['Continue']
      };
  } else {
      return {
          type: jsPsychHtmlButtonResponse,
          stimulus: 'The following block is going to be the one where you see 3 circles of the one kind on the left, then 3 of the other kind on the right. You will be tested on one circle of each, beginning every time with the right (the one you saw last), then moving on to the left.',
          choices: ['Continue']
      };
  }
};

export const singleSetWarning = {
  type: jsPsychHtmlButtonResponse,
  stimulus: 'The following block is going to be the one where you see either 3 or 6 circles of the same kind. The tested circles are chosen at random. Click on "Continue" to begin with the practice trials.',
  choices: ['Continue']
};