import { subjectID } from '../jsp';
import { DESIGN } from '../settings';
import { jsPsych } from "../jsp";
import { counters } from '../settings';


export function storeTrialData(trialData) {
    const dataToStore = {
        subjectID: subjectID,
        whichStimuliFirst: DESIGN.participantGroup,
        areTrialsRandomOrSystematic: DESIGN.participantBlockType,
        dualOrSingleSetFirst: DESIGN.participantBlockOrder,
        practice: trialData.practice,
        blockNumber: counters.blockNumber,
        segmentNumber: counters.segmentNumber,
        trialNumberThisBlock: counters.trialNumberThisBlock,
        trialNumberOverall: counters.trialNumberOverall,
        nStimuli: trialData.nStimuli,
        stimulusType: trialData.stimulusType,
        allPositions: trialData.allPositions || null,
        actualPosition: trialData.actualPosition || null,
        allColors: trialData.allColors || null,
        actualColor: trialData.actualColor || null,
        selectedColor: trialData.selectedColor || null,
        allOrientations: trialData.allOrientations || null,
        actualOrientation: trialData.actualOrientation || null,
        selectedOrientation: trialData.selectedOrientation || null,
        reactionTime: trialData.reactionTime || null,
    };

    jsPsych.data.write(dataToStore);
}


export function incrementCounters() {
    counters.trialNumberThisBlock++;
    counters.trialNumberOverall++;
}

export function resetBlockCounters() {
    counters.trialNumberThisBlock = 1;
    counters.segmentNumber = 1;
    counters.blockNumber++;
}

export function incrementSegmentNumber() {
    counters.segmentNumber++;
}

export function resetTrialinBlockCounter() {
    counters.trialNumberThisBlock = 1;
}