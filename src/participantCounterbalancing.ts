declare const jatos: any;
const n = 50;
let participantID: number | null = null;
let subjects: number[] = [];

// Function to initialize or update the subject list
function initializeSubjects() {
  if (typeof jatos !== 'undefined' && !jatos.batchSession.defined("/subjects")) {
    for (let i = 1; i <= n; ++i) {
      subjects.push(i);
    }
    jatos.batchSession.set("subjects", subjects);
  } else if (typeof jatos !== 'undefined') {
    subjects = jatos.batchSession.get("subjects");
  } else {
    // Fallback for local testing
    participantID = Math.floor(Math.random() * 12) + 1;
    return;
  }
  
  if (subjects.length === 0) {
    alert("Sorry, this experiment is no longer available.");
    window.close();
  } else {
    assignSubjectID();
  }
}

// Function to assign a subject ID
function assignSubjectID() {
  if (typeof jatos !== 'undefined') {
    const subject_index = 0;
    participantID = subjects[subject_index];
    subjects.splice(subject_index, 1);
    jatos.batchSession.set("subjects", subjects);
  }
}

// Initialize subjects on module load
initializeSubjects();

// Type guard to ensure participantID is a number
function getParticipantID(): number {
  if (participantID === null) {
    throw new Error("Participant ID was not properly assigned.");
  }
  return participantID;
}

// Export the participant ID
export const subjectID = getParticipantID();