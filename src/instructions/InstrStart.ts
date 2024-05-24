import instructions from "@jspsych/plugin-instructions";

// Define your instruction slides with images
const instructionSlides = [
  '<div class="main"><img src="assets/images/Slide1.gif" class="image"></img></div>',
  '<div class="main"><img src="assets/images/Slide2.gif" class="image"></img></div>',
  '<div class="main"><img src="assets/images/Slide3.gif" class="image"></img></div>',
  '<div class="main"><img src="assets/images/Slide4.gif" class="image"></img></div>',
  '<div class="main"><img src="assets/images/Slide5.gif" class="image"></img></div>',
  '<div class="main"><img src="assets/images/Slide6.gif" class="image"></img></div>'
];

// Log instruction slides
console.log("Instruction Slides: ", instructionSlides);

// Define the instruction slides configuration
export var instructionSlidesConfig = {
  type: instructions,
  pages: instructionSlides,
  button_label_next: "Continue",
  button_label_previous: "Back",
  show_clickable_nav: true,
};


// Log instruction slides configuration
console.log("Instruction Slides Config: ", instructionSlidesConfig);