let minutes = 0.1; // Countdown duration in minutes
let countdownTime = minutes * 60 * 1000; // Total time in milliseconds

let easyMinute = 20;
let mediumMinute = 40;
let hardMinute = 60;
let endTime = null; // Timestamp when the timer should end
let timerInterval = null;
let isRunning = false;
let isVisible = true;

window.onload = function() {
  initializeTimer
};


function initializeTimer() {
  const timerOverlay = document.createElement('div');
  timerOverlay.id = 'timer-overlay';
  timerOverlay.innerHTML = `
    <span id="countdown">100:00</span>
    <button id="startTimerButton">Start Timer</button>
    <button id="resetTimerButton">Reset Timer</button>
    <button id="showHideTimerButton">Hide Timer</button>
  `;
  document.body.appendChild(timerOverlay);

  let parentDiv = document.querySelector(`.flexlayout__tab`);
  let difficulty = "None";

  if (parentDiv) {
    difficulty = parentDiv.children[0].children[0].children[1].children[0].textContent;
    console.log("Found the target div:");
    console.log("diff:", difficulty);
    if (difficulty == "Easy") {
      console.log(minutes)
      minutes = easyMinute;
      console.log(minutes)
    } else if (difficulty == "Medium") {
      minutes = mediumMinute;
    }  else {
      minutes = hardMinute;
    }
    countdownTime = minutes * 60 * 1000;
  } else {
    console.log("No div found with the class:", parentDiv);
  }

  updateTimerDisplay(); // initialize timer text on start
  return minutes
};

function formatTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
}

function updateTimerDisplay() {
  const now = Date.now();
  const remainingTime = endTime ? Math.max(endTime - now, 0) : countdownTime; // Default to initial value

  document.getElementById('countdown').textContent = formatTime(remainingTime);

  // Stop the timer when it reaches 0
  if (remainingTime <= 0 && isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    alert("Time's up!");
  }
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  endTime = Date.now() + countdownTime; // Calculate the end timestamp
  timerInterval = setInterval(updateTimerDisplay, 100); // Refresh every 100ms
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = 5;
  isRunning = false;
  endTime = null;
  updateTimerDisplay(); // Reset display
}

function showHideTime() {
  const countdownElement = document.getElementById('countdown');
  if (isVisible) {
    countdownElement.style.display = 'none';
    document.getElementById('showHideTimerButton').textContent = 'Show Timer';
  } else {
    countdownElement.style.display = 'block';
    document.getElementById('showHideTimerButton').textContent = 'Hide Timer';
  }
  isVisible = !isVisible; // Toggle visibility state
}

// Event listeners for buttons
document.body.addEventListener('click', (event) => {
  if (event.target.id === 'startTimerButton') startTimer();
  if (event.target.id === 'resetTimerButton') resetTimer();
  if (event.target.id === 'showHideTimerButton') showHideTime();
});


module.exports = {initializeTimer};