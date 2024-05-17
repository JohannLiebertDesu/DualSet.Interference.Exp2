import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

export const blankScreenStageOne = {
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 1000,
    on_start: function () {
      console.log('Blank Screen Stage One started');
    },
    on_finish: function (data) {
      console.log('Blank Screen Stage One finished');
    }
  };
  
  export const blankScreenStageTwo = {
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 100,
    on_start: function () {
      console.log('Blank Screen Stage Two started');
    },
    on_finish: function (data) {
      console.log('Blank Screen Stage Two finished');
    }
  };
  
  export const blankScreenStageThree = {
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 1000,
    on_start: function () {
      console.log('Blank Screen Stage Three started');
    },
    on_finish: function (data) {
      console.log('Blank Screen Stage Three finished');
    }
  };
  