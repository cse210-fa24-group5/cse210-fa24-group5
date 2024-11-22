// Create a container for the overlay
const timerOverlay = document.createElement('div');
timerOverlay.id = 'timerOverlay';
timerOverlay.innerHTML = `
  <div id="timerContent">
    <span id="countdown">100:00</span>
    <button id="startTimerButton">Start Timer</button>
    <button id="resetTimerButton">Reset Timer</button>
    <button id="showHideTimerButton">Hide Timer</button>
  </div>
`;
document.body.appendChild(timerOverlay);

let minutes = 0.1
let countdownTime = minutes * 60; // seconds
let timerInterval;
let show = true;
let running = false;

function updateTimerDisplay() {
  const minutes = Math.floor(countdownTime / 60);
  const seconds = countdownTime % 60;

  document.getElementById('countdown').textContent =
    `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    countdownTime = minutes * 60;
    running = false;
    updateTimerDisplay();
}

function startTimer() {
    if (running) {
        return; // do nothing if already running
    } else {
        running = true;
        timerInterval = setInterval(() => {
            if (countdownTime <= 0) {
                clearInterval(timerInterval);
                alert("Time's up!");
                resetTimer();
                return;
            }
            countdownTime--;
            updateTimerDisplay();
        }, 1000); // ran every second
    }
    
}

function showHideTime() {
    if (show) {
        show = false;
        document.getElementById('countdown').style.display = 'none';
        document.getElementById('showHideTimerButton').textContent = 'Show Timer'; 
    } else {
        show = true;
        document.getElementById('countdown').style.display = 'block';
        document.getElementById('showHideTimerButton').textContent = 'Hide Timer'; 
    }
}

document.body.addEventListener('click', (event) => {
  if (event.target && event.target.id === 'startTimerButton') {
    startTimer();
  }
  if (event.target && event.target.id === 'resetTimerButton') {
    resetTimer();
  }
  if (event.target && event.target.id === 'showHideTimerButton') {
    showHideTime();
  }
});

updateTimerDisplay(); // initialize timer text on start