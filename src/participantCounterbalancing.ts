declare const jatos: any;

const n = 50;
let participantID: number | null = null;
let subjects: number[] = [];
let subjectsCompleted: number[] = [];

// Function to initialize or update the subject lists
export function initializeSubjects(): number | null {
    if (typeof jatos !== 'undefined') {
        if (!jatos.batchSession.defined("/subjects")) {
            for (let i = 1; i <= n; ++i) {
                subjects.push(i);
            }
            jatos.batchSession.set("subjects", subjects);
            jatos.batchSession.set("subjects_completed", []);
        } else {
            subjects = jatos.batchSession.get("subjects");
        }
    } else {
        // Fallback for local testing
        participantID = Math.floor(Math.random() * 12) + 1;
        return participantID;
    }

    if (subjects.length === 0) {
        alert("Sorry, this experiment is no longer available.");
        window.close();
    } else {
        assignSubjectID();
    }

    return participantID;
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

// Function to mark a subject as completed
export function markSubjectAsCompleted() {
    if (typeof jatos !== 'undefined' && participantID !== null) {
        subjectsCompleted.push(participantID);
        jatos.batchSession.set("subjects_completed", subjectsCompleted);
    }
}

