import { subjectID } from '../participantCounterbalancing';
import { expInfo } from '../settings';
import { jsPsych } from "../jsp";

let blockNumber = 0;
let trialNumberOverall = 0;
let trialNumberThisBlock = 0;
let segmentNumber = 0;

export function storeTrialData(trialData) {
    jsPsych.data.write({
      subjectID: subjectID,
      whichStimuliFirst: expInfo.DESIGN.participantGroup,
      areTrialsRandomOrSystematic: expInfo.DESIGN.participantBlockType,
      dualOrSingleSetFirst: expInfo.DESIGN.participantBlockOrder,
      blockNumber: blockNumber,
      segmentNumber: segmentNumber,
      trialNumberThisBlock: trialNumberThisBlock,
      trialNumberOverall: trialNumberOverall,
      practice: trialData.practice,
      reactionTime: trialData.rt,
      stimulusType: trialData.stimulusType,
      stimuliPosition: trialData.stimuli.Position,
      selectedColor: trialData.selectedColor || null,
      selectedOrientation: trialData.selectedOrientation || null,
      actualColor: trialData.actualColor || null,
      actualOrientation: trialData.actualOrientation || null,
    });
  }
  