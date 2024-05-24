// Global variables
import { jsPsych } from "./jsp";

// Import the psychophysics and keyboard plugins
import psychophysics from "@kurokida/jspsych-psychophysics";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, selectRandomCircle, radius } from "./gridAndStimuli";

// Color wheel drawing function
import { drawColorWheel, outerRadius, ratio, calculateColorFromAngle, getAngleFromCoordinates, getRandomRotationAngle, drawOrientationWheel } from "./drawWheels";


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

export const blankScreenStageOneShort = createBlankScreenStage(1000, 'Blank Screen Stage One Short');
export const blankScreenStageOneLong = createBlankScreenStage(2300, 'Blank Screen Stage One Long');
export const blankScreenStageTwo = createBlankScreenStage(100, 'Blank Screen Stage Two');
export const blankScreenStageThree = createBlankScreenStage(1000, 'Blank Screen Stage Three');


let lastMouseX = 0;
let lastMouseY = 0;

// Creating the color wheel stage

export const createColorWheelStage = (stageName, stimulusType, dataKey, onFinishCallback) => ({
  type: psychophysics,
  stimuli: function () {
    console.log('Stimulus Type:', stimulusType);
    console.log('Data Key:', dataKey);

    let previousStimuli = jsPsych.data.get().values().filter(trial => trial.key === dataKey).pop()?.value || [];
    if (previousStimuli.length === 0) {
      console.error('No previous stimuli found.');
      return [];
    }
    
    const { selectedStimulus, remainingStimuli } = selectRandomCircle(previousStimuli);
    jsPsych.data.write({ key: 'stimuli', value: remainingStimuli });
    console.log(`Selected Circle for ${stageName}:`, selectedStimulus);

    const rotationAngle = jsPsych.data.get().last(1).values()[0].rotationAngle || getRandomRotationAngle();
    jsPsych.data.write({ key: 'rotationAngle', value: rotationAngle });

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

export const createOrientationWheelStage = (stageName, stimulusType, dataKey, onFinishCallback) => ({
  type: psychophysics,
  stimuli: function () {
    console.log('Stimulus Type:', stimulusType);
    console.log('Data Key:', dataKey);

    let previousStimuli = jsPsych.data.get().values().filter(trial => trial.key === dataKey).pop()?.value || [];
    if (previousStimuli.length === 0) {
      console.error('No previous stimuli found.');
      return [];
    }

    const { selectedStimulus, remainingStimuli } = selectRandomCircle(previousStimuli);
    if (!selectedStimulus) {
      console.error('No circle stimulus found.');
      return [];
    }
    jsPsych.data.write({ key: 'stimuli', value: remainingStimuli });
    console.log(`Selected Circle for ${stageName}:`, selectedStimulus);

    const orientationWheelObject = drawOrientationWheel(outerRadius, ratio, [selectedStimulus.startX, selectedStimulus.startY]);

    const centerX = selectedStimulus.startX;
    const centerY = selectedStimulus.startY;
    const lineWidth = 2;

    console.log(`Initial center coordinates: centerX = ${centerX}, centerY = ${centerY}`);

    return [
      orientationWheelObject,
      {
        ...selectedStimulus,
        fill_color: 'transparent', // No fill color
        line_color: 'black' // Black border
      },
      {
        obj_type: 'manual',
        startX: centerX,
        startY: centerY,
        drawFunc: function (stimulus, canvas, context) {
          const x = lastMouseX;
          const y = lastMouseY;
          const angle = getAngleFromCoordinates(x, y, centerX, centerY);
          const x2 = centerX + radius * Math.cos(angle * Math.PI / 180);
          const y2 = centerY + radius * Math.sin(angle * Math.PI / 180);

          context.clearRect(0, 0, canvas.width, canvas.height);
          drawOrientationWheel(outerRadius, ratio, [centerX, centerY]).drawFunc(null, canvas, context);

          // Draw circle with black border and no fill
          context.strokeStyle = 'black';
          context.lineWidth = 2;
          context.beginPath();
          context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          context.stroke();

          // Draw line
          context.beginPath();
          context.moveTo(centerX, centerY);
          context.lineTo(x2, y2);
          context.stroke();
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
        const centerX = currentStimulus.startX;
        const centerY = currentStimulus.startY;

        console.log(`Loaded center coordinates: centerX = ${centerX}, centerY = ${centerY}`);

        canvas.addEventListener('mousemove', function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          lastMouseX = x;
          lastMouseY = y;
          console.log('mousemove event:', x, y);
        });

        canvas.addEventListener('click', function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          console.log('click event:', x, y);

          const angle = getAngleFromCoordinates(x, y, centerX, centerY);
          const x2 = centerX + radius * Math.cos(angle * Math.PI / 180);
          const y2 = centerY + radius * Math.sin(angle * Math.PI / 180);

          jsPsych.data.write({ selected_orientation: { x2, y2 } });
          console.log('Mouse clicked:', x, y, 'Line end:', x2, y2);

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









