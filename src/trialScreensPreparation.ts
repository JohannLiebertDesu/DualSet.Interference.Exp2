// Global variables
import { jsPsych } from "./jsp";

// Import the psychophysics and keyboard plugins
import psychophysics from "@kurokida/jspsych-psychophysics";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, numColumns, numRows, createGrid, resetGrid, calculateCellSize, generateCircles, Stimulus, selectRandomCircle } from "./gridLogic";

// Color wheel drawing function
import { drawColorWheel, outerRadius, ratio, calculateColorFromAngle, getAngleFromCoordinates, getRandomRotationAngle } from "./colorWheel";



function createBlankScreenStage(duration: number, stageName: string) {
  return {
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: duration,
    on_start: function () {
      console.log(`${stageName} started`);
    },
    on_finish: function (data) {
      console.log(`${stageName} finished`);
    }
  };
}

export const blankScreenStageOne = createBlankScreenStage(1000, 'Blank Screen Stage One');
export const blankScreenStageTwo = createBlankScreenStage(100, 'Blank Screen Stage Two');
export const blankScreenStageThree = createBlankScreenStage(1000, 'Blank Screen Stage Three');


let lastMouseX = 0;
let lastMouseY = 0;

export const createColorWheelStage = (stageName: string, onFinishCallback?: (data: any) => void) => ({
  type: psychophysics,
  stimuli: function () {
    let previousStimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
    const { selectedStimulus, remainingStimuli } = selectRandomCircle(previousStimuli);
    jsPsych.data.write({ key: 'stimuli', value: remainingStimuli });
    console.log(`Selected Circle for ${stageName}:`, selectedStimulus);

    const rotationAngle = jsPsych.data.get().last(1).values()[0].rotationAngle || getRandomRotationAngle();
    jsPsych.data.write({ key: 'rotationAngle', value: rotationAngle }); // Save the rotation angle if not present

    const colorWheelObject = drawColorWheel(outerRadius, ratio, [selectedStimulus.startX, selectedStimulus.startY], rotationAngle);

    return [
      colorWheelObject,
      {
        ...selectedStimulus,
        fill_color: 'gray',
        line_color: 'gray',
        original_color: selectedStimulus.original_color,
        change_attr: function (stim, times, frames) {
          if (frames > 0) {
            const canvas = document.querySelector('canvas');
            if (canvas) {
              const context = canvas.getContext('2d');
              if (context) {
                const rect = canvas.getBoundingClientRect();
                const x = lastMouseX;
                const y = lastMouseY;
                const centerX = stim.startX;
                const centerY = stim.startY;
                const angle = getAngleFromCoordinates(x, y, centerX, centerY);
                const color = calculateColorFromAngle(angle, rotationAngle);
                stim.fill_color = color;
                stim.line_color = color;
                console.log('Color updated to:', color);
              } else {
                console.error('Context not found');
              }
            } else {
              console.error('Canvas not found');
            }
          }
        }
      }
    ];
  },
  choices: "NO_KEYS",
  canvas_size: [screenWidth, screenHeight],
  background_color: '#FFFFFF',
  on_start: function () {
    console.log(`${stageName} started`);
  },
  on_finish: onFinishCallback || function (data) {
    console.log(`${stageName} finished`);
  },
  on_load: function () {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        const rect = canvas.getBoundingClientRect();
        const stimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
        const currentStimulus = stimuli[stimuli.length - 1];
        const rotationAngle = jsPsych.data.get().last(1).values()[0].rotationAngle;
        const centerX = currentStimulus.startX;
        const centerY = currentStimulus.startY;

        canvas.addEventListener('mousemove', function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          lastMouseX = x;
          lastMouseY = y;

          const angle = getAngleFromCoordinates(x, y, centerX, centerY);
          const color = calculateColorFromAngle(angle, rotationAngle);

          context.clearRect(0, 0, canvas.width, canvas.height);
          drawColorWheel(outerRadius, ratio, [centerX, centerY], rotationAngle).drawFunc(null, canvas, context);

          context.fillStyle = color;
          context.strokeStyle = color;
          context.lineWidth = 5;
          context.beginPath();
          context.arc(centerX, centerY, 50, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
          console.log('Mouse moved:', x, y, 'Color:', color);
        });

        canvas.addEventListener('click', function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const angle = getAngleFromCoordinates(x, y, centerX, centerY);
          const color = calculateColorFromAngle(angle, rotationAngle);

          jsPsych.data.write({ selected_color: color });
          console.log('Mouse clicked:', x, y, 'Color:', color);

          jsPsych.finishTrial();
        });
      } else {
        console.error('Context not found');
      }
    } else {
      console.error('Canvas not found');
    }
  }
});
