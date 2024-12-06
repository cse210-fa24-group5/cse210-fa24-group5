let minutes = 0.06; // Initial Dummy Duration of Timer in Minutes (4 seconds)
var countdownTime = minutes * 60 * 1000; // Converts time to milliseconds

var easyMinute = 11; // Default Time for Easy Diff Problems
var mediumMinute = 33; // Default Time for Medium Diff Problems
var hardMinute = 55; // Default Time for Hard Diff Problems
var endTime = null; // Timestamp when the timer should end
var timerInterval = null; // Stores the ID of the active interval (let's us clear or stop timer)
var isRunning = false; // Status Checker for if Timer is counting down or not
var isVisible = true; // Status Checker for if Timer is Visible or Hidden
let isDragging = false; //whether currently dragging timer
let offsetX, offsetY; // Positions of mouse, used for dragging
let isListenerAdded = false; // Whether listeners for dragging already added

/**
 *
 * @param {number} ms - remaining timestamp in number format
 * @returns {string} formatted - formatted time for timer to display
 */
function formatTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formatted = `${minutes}:${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}`;

  return formatted;
}

/**
 * Updates timer's display time based on remaining time
 */
function updateTimerDisplay() {
  const now = Date.now();
  const remainingTime = endTime ? Math.max(endTime - now, 0) : countdownTime; // Default to initial value

  document.getElementById("countdown").textContent = formatTime(remainingTime);

  // Stop the timer when it reaches 0
  if (remainingTime <= 0 && isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    setTimeout(() => {
      alert("Time's up!");
    }, 10);
  }
}

/**
 * Starts timer if timer is not currently running
 */
function startTimer() {
  if (isRunning) return;

  isRunning = true;
  endTime = Date.now() + countdownTime; // Calculate the end timestamp
  timerInterval = setInterval(updateTimerDisplay, 100); // Refresh every 100ms
}

/**
 * Resets timer
 */
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = 5;
  isRunning = false;
  endTime = null;
  updateTimerDisplay(); // Reset display
}

/**
 * Toggles visibility of countdown time
 */
function showHideTime() {
  const countdownElement = document.getElementById("countdown");
  if (isVisible) {
    countdownElement.style.display = "none";
    document.getElementById("showHideTimerButton").textContent = "Show Timer";
  } else {
    countdownElement.style.display = "block";
    document.getElementById("showHideTimerButton").textContent = "Hide Timer";
  }
  isVisible = !isVisible; // Toggle visibility state
}

/**
 * Checks if difficulty is available on current page
 * @returns {string | null} - Fetched difficulty of current problem or null if not found
 */
function checkDifficulty() {
  let parentDiv = document.querySelector(`.flexlayout__tab`);
  if (!parentDiv) {
    return null;
  }
  let difficulty;
  difficulty =
    parentDiv.children[0].children[0].children[1].children[0].textContent;
  return difficulty;
}

/**
 * Adds listeners for dragging if they are not already present
 */
function addDraggingListeners() {
  const timerOverlay = document.getElementById("timer-overlay");
  if (!isListenerAdded) {
    timerOverlay.addEventListener('mousedown', function(event) {
      document.body.style.userSelect = 'none'; //can't select text when dragging
      isDragging = true;
      offsetX = event.clientX - timerOverlay.offsetLeft;
      offsetY = event.clientY - timerOverlay.offsetTop;
      timerOverlay.style.cursor = 'grabbing'; 
    });
    document.addEventListener('mousemove', function(event) {
        if (isDragging) {
          timerOverlay.style.left = event.clientX - offsetX + 'px';
          timerOverlay.style.top = event.clientY - offsetY + 'px';
        }
    });
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            document.body.style.userSelect = '';
            isDragging = false;
            timerOverlay.style.cursor = 'grab';
        }
    });
  }
}

/**
 * Initializes timer's components and remaining time
 * @returns {number}  minutes - minutes remaining for timer
 */
function initializeTimer(times = [20, 40, 60]) {
  easyMinute = times[0];
  mediumMinute = times[1];
  hardMinute = times[2];
  const timerOverlay = document.createElement("div");
  timerOverlay.id = "timer-overlay";
  timerOverlay.innerHTML = `
    <span id="countdown">99:99</span>
    <button id="startTimerButton">Start Timer</button>
    <button id="resetTimerButton">Reset Timer</button>
    <button id="showHideTimerButton">Hide Timer</button>
    <button id="settingPageButton">Set Times</button>
  `;
  const timr = document.getElementById("timer-overlay");
  if (timr) {
    console.log("Timer found");
  } else {
    document.body.appendChild(timerOverlay);
    addDraggingListeners();
    //set initial position without using right, needed because otherwise conflict with dragging
    const rect = timerOverlay.getBoundingClientRect();
    const parentWidth = window.innerWidth;
    timerOverlay.style.left = `${parentWidth - rect.width - 50}px`;
  }
  let difficulty = checkDifficulty();
  if (difficulty == "Easy") {
    minutes = easyMinute;
  } else if (difficulty == "Medium") {
    minutes = mediumMinute;
  } else if (difficulty == "Hard") {
    minutes = hardMinute;
  } else {
    console.log("No difficulty found (expected for Timer unit test)");
  }
  countdownTime = minutes * 60 * 1000;

  resetTimer(); // initialize timer text on start
  return minutes;
}

function fetchTimeAndInitialize() {
  let times = [21, 41, 61];
  chrome.storage.local.get(["mins"], (result) => {
    times = result.mins;
    initializeTimer(times);
  });
}

function showSettingsPage() {
  const settingPage = document.getElementById("setting-overlay");
  if (settingPage) {
    console.log("Setting Page found");
    settingPage.style.display = "flex";
  } else {
    const settingsOverlay = document.createElement("div");
    settingsOverlay.id = "setting-overlay";
    settingsOverlay.innerHTML = `
      <label for="easy">Easy (Minutes): </label>
      <input type="number" id="easy">
      <label for="medium">Medium (Minutes): </label>
      <input type="number" id="medium">
      <label for="hard">Hard (Minutes): </label>
      <input type="number" id="hard">
      <button id="submitSettingButton">Submit</button>
      <button id="closeSettingPageButton">Close</button>
    `;
    document.body.appendChild(settingsOverlay);
  }
  document.getElementById("easy").value = easyMinute;
  document.getElementById("medium").value = mediumMinute;
  document.getElementById("hard").value = hardMinute;
}

function hideSettingsPage() {
  const settingsElement = document.getElementById("setting-overlay");
  settingsElement.style.display = "none";
}

function submitSettings() {
  const ez = document.getElementById("easy").value;
  const mid = document.getElementById("medium").value;
  const hard = document.getElementById("hard").value;
  const newTimes = [ez, mid, hard];
  chrome.storage.local.set({ mins: newTimes }, () => {
    window.alert("Settings Saved!");
    fetchTimeAndInitialize();
    hideSettingsPage();
  });
}

window.addEventListener("load", () => {
  fetchTimeAndInitialize();
});

/**
 * Listeners for buttons
 */
document.body.addEventListener("click", (event) => {
  if (event.target.id === "startTimerButton") startTimer();
  if (event.target.id === "resetTimerButton") resetTimer();
  if (event.target.id === "showHideTimerButton") showHideTime();
  if (event.target.id === "settingPageButton") showSettingsPage();
  if (event.target.id === "closeSettingPageButton") hideSettingsPage();
  if (event.target.id === "submitSettingButton") submitSettings();
});

/**
 * Resets timer on changing to problem on same page
 */
function onUrlChange() {
  console.log("URL changed to:", window.location.href);
  fetchTimeAndInitialize();
  resetTimer();
}
const titleObserver = new MutationObserver(() => {
  onUrlChange();
});

/**
 * Check dependencies, only run observer if in browser
 * @returns true if in test environment, false if not
 */
function isESModuleSupported() {
  try {
    new Function("import('data:text/javascript,export{}')");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
if (isESModuleSupported()) {
  module.exports = {
    initializeTimer,
    checkDifficulty,
    isESModuleSupported,
    onUrlChange,
  };
} else {
  titleObserver.observe(document.querySelector("title"), { childList: true });
}
