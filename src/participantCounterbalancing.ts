declare const jatos: any;

const n = 50;
let participantID: number | null = null;
let subjects: number[] = [];

// Function to initialize the subject lists if not already done
export function initializeSubjectsList() {
  if (typeof jatos !== 'undefined') {
      if (!jatos.batchSession.defined("/subjects")) {
          for (let i = 1; i <= n; ++i) {
              subjects.push(i);
          }
          jatos.batchSession.set("subjects", subjects);
      } else {
          subjects = jatos.batchSession.get("subjects");
      }
  } else {
      // Fallback for local testing
      participantID = Math.floor(Math.random() * 12) + 1;
      return participantID;
  }
}

// Function to assign a subject ID
export function assignSubjectID() {
  if (typeof jatos !== 'undefined') {
      if (subjects.length === 0) {
          alert("Sorry, this experiment is no longer available.");
          window.close();
      } else {
          const subject_index = 0;
          participantID = subjects[subject_index];
          subjects.splice(subject_index, 1);
          jatos.batchSession.set("subjects", subjects);
      }
  } else {
      return participantID;
  }
  return participantID;
}

// Function to mark a subject as completed
export async function markSubjectAsCompleted() {
  if (typeof jatos !== 'undefined' && participantID !== null) {
      // Fetch the current list of completed subjects from the batch session
      let subjectsCompleted = jatos.batchSession.get("subjects_completed") || [];

      // Ensure subjectsCompleted is an array
      if (!Array.isArray(subjectsCompleted)) {
          subjectsCompleted = [];
      }

      // Add the current participant ID to the list
      let newParticipant = `Participant${participantID}Done`;
      subjectsCompleted.push(newParticipant);

      // Wait for 50ms
      await new Promise(resolve => setTimeout(resolve, 50));

      // Update the batch session with the new list
      jatos.batchSession.set("subjects_completed", subjectsCompleted);
  }
}

