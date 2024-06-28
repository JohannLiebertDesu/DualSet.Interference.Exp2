// Global variables
import { jsPsych } from "./jsp";

// Import the psychophysics and keyboard plugins
import psychophysics from "@kurokida/jspsych-psychophysics";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

// Grid logic and stimuli generation
import { screenWidth, screenHeight, selectRandomCircle, selectRandomLine, radius, Stimulus } from "./gridAndStimuli";

// Color wheel drawing function
import { drawColorWheel, outerRadius, ratio, calculateColorFromAngle, getAngleFromCoordinates, getRandomRotationAngle, drawOrientationWheel } from "./drawWheels";

// Data saving code
import { storeTrialData } from "./data/dataStorage"; 
import { subjectID } from "./experiment";
import { counters, DESIGN } from "./settings";


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

let currentStimuli: Stimulus[] = []; // Global variable to store stimuli

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

    const rotationAngle = getRandomRotationAngle();
    jsPsych.data.write({ key: 'rotationAngle', value: rotationAngle });

    const colorWheelObject = drawColorWheel(outerRadius, ratio, [selectedStimulus.startX, selectedStimulus.startY], rotationAngle);

    // Store the selected stimulus in the global variable
    currentStimuli = [selectedStimulus];

    return [
      colorWheelObject,
      {
        ...selectedStimulus,
        fill_color: 'gray',
        line_color: 'gray',
        original_color: selectedStimulus.original_color,
        obj_type: 'manual',
        drawFunc: function (stimulus, canvas, context) {
          const x = lastMouseX;
          const y = lastMouseY;
          const centerX = selectedStimulus.startX;
          const centerY = selectedStimulus.startY;
          const angle = getAngleFromCoordinates(x, y, centerX, centerY);
          const color = calculateColorFromAngle(angle, rotationAngle);

          context.clearRect(0, 0, canvas.width, canvas.height);
          drawColorWheel(outerRadius, ratio, [centerX, centerY], rotationAngle).drawFunc(null, canvas, context);

          // Draw the selected stimulus circle with updated color
          context.fillStyle = color;
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.beginPath();
          context.arc(centerX, centerY, selectedStimulus.radius, 0, 2 * Math.PI);
          context.fill();
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
    // Record the start time of the trial
    this.start_time = performance.now();
  },
  on_finish: function (data) {
    console.log(`${stageName} finished`);
    // Calculate the reaction time
    const end_time = performance.now();
    const reactionTime = end_time - this.start_time;
    // Retrieve the stimuli from the global variable
    const selectedStimulus = currentStimuli.find(stim => stim.fill_color !== 'gray');
    if (!selectedStimulus) {
      console.error('Selected stimulus not found');
      return;
    }

    const actualColor = selectedStimulus.original_color;
    const actualPosition = { startX: selectedStimulus.startX, startY: selectedStimulus.startY };
    const selectedColor = data.selected_color;  // Access the selected color directly from data

    const trialData = {
      practice: jsPsych.timelineVariable('practice'),
      trialNumberThisBlock: counters.trialNumberThisBlock - 1,  // Subtract 1 to account for the increment in the counter which happens before the second part of the same trial occurs. This is not ideal, but it is a workaround.
      trialNumberOverall: counters.trialNumberOverall - 1,  // Same as above
      blockNumber: counters.blockNumber,
      segmentNumber: counters.segmentNumber,
      subjectID: subjectID,
      whichStimuliFirst: DESIGN.participantGroup,
      areTrialsRandomOrSystematic: DESIGN.participantBlockType,
      dualOrSingleSetFirst: DESIGN.participantBlockOrder,
      stimulusType: stimulusType,  // Use the parameter value directly
      reactionTime: reactionTime || null,
      actualColor: actualColor || null,
      selectedColor: selectedColor || null,
      actualPosition: actualPosition || null
    };

    console.log('Trial Data:', trialData);

    // Ensure the data is stored
    storeTrialData(trialData);

    // Remove event listeners
    if (this.mouseMoveListener && this.clickListener) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.removeEventListener('mousemove', this.mouseMoveListener);
        canvas.removeEventListener('click', this.clickListener);
        // Remove the canvas element
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
          console.log('Canvas removed');
        }
      }
    }

    // Conditionally execute the provided onFinishCallback
    if (onFinishCallback) {
      onFinishCallback(data);
    }
  },
  on_load: function () {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        const rect = canvas.getBoundingClientRect();
        const stimuli = jsPsych.data.get().values().filter(trial => trial.key === 'stimuli').pop().value;
        const currentStimulus = stimuli[stimuli.length - 1];
        const lastRotationAngleEntry = jsPsych.data.get().filter({ key: 'rotationAngle' }).last(1).values()[0];
        const rotationAngle = lastRotationAngleEntry ? lastRotationAngleEntry.value : undefined;       
        const centerX = currentStimulus.startX;
        const centerY = currentStimulus.startY;

        this.mouseMoveListener = function (e) {
          const rect = canvas.getBoundingClientRect();
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
        }.bind(this);

        this.clickListener = function (e) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const angle = getAngleFromCoordinates(x, y, centerX, centerY);
          const color = calculateColorFromAngle(angle, rotationAngle);

          jsPsych.finishTrial({
            selected_color: color  // Pass the selected color directly to the on_finish function
          });
        }.bind(this);

        canvas.addEventListener('mousemove', this.mouseMoveListener);
        canvas.addEventListener('click', this.clickListener);
      } else {
        console.error('Context not found');
      }
    } else {
      console.error('Canvas not found');
    }
  }
});



let selectedStimulusGlobal: Stimulus | null = null; // Initialize as null

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

    const { selectedStimulus, remainingStimuli } = selectRandomLine(previousStimuli);
    if (!selectedStimulus) {
      console.error('No line stimulus found.');
      return [];
    }
    jsPsych.data.write({ key: 'stimuli', value: remainingStimuli });
    console.log(`Selected line for ${stageName}:`, selectedStimulus);

    selectedStimulusGlobal = selectedStimulus; // Set the global variable

    console.log('Selected Stimulus:', selectedStimulus);

    const centerX = selectedStimulus.x1;
    const centerY = selectedStimulus.y1;

    if (centerX === undefined || centerY === undefined) {
      console.error('Selected stimulus does not have valid x1 or y1.');
      return [];
    }

    const orientationWheelObject = drawOrientationWheel(outerRadius, ratio, [centerX, centerY]);

    console.log(`Initial center coordinates: centerX = ${centerX}, centerY = ${centerY}`);

    return [
      orientationWheelObject,
      {
        ...selectedStimulus,
        fill_color: 'transparent', // No fill color
        line_color: 'black' // Black border
      },
      {
        // This part is responsible for continuously updating the line based on mouse movement.
        obj_type: 'manual',
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

    // Record the start time of the trial
    this.start_time = performance.now();
  },
  on_finish: function (data) {
    console.log(`${stageName} finished`);
    
    // Calculate the reaction time
    const end_time = performance.now();
    const reactionTime = end_time - this.start_time;

    // Retrieve the stimuli from the global variable
    if (selectedStimulusGlobal) { // Check if selectedStimulusGlobal is not null
      const selectedStimulus = selectedStimulusGlobal;
      if (!selectedStimulus) {
        console.error('Selected stimulus not found');
        return;
      }

      const actualOrientation = {
        startX: selectedStimulus.x2,
        startY: selectedStimulus.y2
      };
      const selectedOrientation = data.selected_line_end;
      const actualPosition = { startX: selectedStimulus.x1, startY: selectedStimulus.y1 };

      const trialData = {
        practice: jsPsych.timelineVariable('practice'),
        trialNumberThisBlock: counters.trialNumberThisBlock - 1,  // Subtract 1 to account for the increment in the counter which happens before the second part of the same trial occurs. This is not ideal, but it is a workaround.
        trialNumberOverall: counters.trialNumberOverall - 1,  // Same as above
        blockNumber: counters.blockNumber,
        segmentNumber: counters.segmentNumber,
        subjectID: subjectID,
        whichStimuliFirst: DESIGN.participantGroup,
        areTrialsRandomOrSystematic: DESIGN.participantBlockType,
        dualOrSingleSetFirst: DESIGN.participantBlockOrder,
        stimulusType: stimulusType,  // Use the parameter value directly
        reactionTime: reactionTime || null,
        actualPosition: actualPosition || null,
        actualOrientation: actualOrientation || null,
        selectedOrientation: selectedOrientation || null,
      };

      console.log('Trial Data:', trialData);

      // Ensure the data is stored
      storeTrialData(trialData);

      // Remove event listeners
      if (this.mouseMoveListener && this.clickListener) {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.removeEventListener('mousemove', this.mouseMoveListener);
          canvas.removeEventListener('click', this.clickListener);
          // Remove the canvas element
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
            console.log('Canvas removed');
          }
        }
      }

      // Conditionally execute the provided onFinishCallback
      if (onFinishCallback) {
        onFinishCallback(data);
      }
    }
  },
  on_load: function () {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        const rect = canvas.getBoundingClientRect();

        if (selectedStimulusGlobal) { // Check if selectedStimulusGlobal is not null
          const currentStimulus = selectedStimulusGlobal;
          const centerX = currentStimulus.x1;
          const centerY = currentStimulus.y1;

          if (centerX === undefined || centerY === undefined) {
            console.error('Selected stimulus does not have valid x1 or y1.');
            return;
          }

          console.log(`Loaded center coordinates: centerX = ${centerX}, centerY = ${centerY}`);

          this.mouseMoveListener = function (e) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            lastMouseX = x;
            lastMouseY = y;
          }.bind(this);

          this.clickListener = function (e) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            console.log('click event:', x, y);

            const angle = getAngleFromCoordinates(x, y, centerX, centerY);
            const x2 = centerX + radius * Math.cos(angle * Math.PI / 180);
            const y2 = centerY + radius * Math.sin(angle * Math.PI / 180);

            console.log('Mouse clicked:', x, y, 'Line end:', x2, y2);

            jsPsych.finishTrial({
              selected_line_end: { x2: x2, y2: y2 } // Pass the selected line end as an object with x and y properties
            });
          }.bind(this);

          canvas.addEventListener('mousemove', this.mouseMoveListener);
          canvas.addEventListener('click', this.clickListener);
        } else {
          console.error('Selected stimulus is not available');
        }
      } else {
        console.error('Context not found');
      }
    } else {
      console.error('Canvas not found');
    }
  }
});







