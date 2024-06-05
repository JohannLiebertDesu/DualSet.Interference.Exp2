import { subjectID } from '../participantCounterbalancing';
import { expInfo } from '../settings';
import { jsPsych } from "../jsp";
import { counters } from '../settings';



export function storeTrialData(trialData) {
    jsPsych.data.write({
      subjectID: subjectID,
      whichStimuliFirst: expInfo.DESIGN.participantGroup,
      areTrialsRandomOrSystematic: expInfo.DESIGN.participantBlockType,
      dualOrSingleSetFirst: expInfo.DESIGN.participantBlockOrder,
      blockNumber: counters.blockNumber,
      segmentNumber: counters.segmentNumber,
      trialNumberThisBlock: counters.trialNumberThisBlock,
      trialNumberOverall: counters.trialNumberOverall,
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