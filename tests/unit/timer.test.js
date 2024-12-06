/**
 * @jest-environment jsdom
 */
const { initializeTimer, checkDifficulty, isESModuleSupported } = require("../../src/timer");
const {
  describe,
  beforeEach,
  afterEach,
  jest,
  it,
  expect,
} = require("@jest/globals");

describe("Timer Functionality", () => {
  let countdownElement, startTimerButton, resetTimerButton, showHideTimerButton;

  beforeEach(() => {
    // Initialize the timer
    initializeTimer();

    // Get DOM elements
    countdownElement = document.getElementById("countdown");
    startTimerButton = document.getElementById("startTimerButton");
    resetTimerButton = document.getElementById("resetTimerButton");
    showHideTimerButton = document.getElementById("showHideTimerButton");

    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clear mocks and restore real timers
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("counts down time correctly", () => {
    startTimerButton.click(); // Start the timer

    // Advance time by 2 seconds
    jest.advanceTimersByTime(2000);

    // Check the countdown display
    expect(countdownElement.textContent).toBe("0:02"); // Timer should decrement by 2 seconds
  });

  it("resets the timer correctly", () => {
    startTimerButton.click(); // Start the timer

    // Advance time by 3 seconds
    jest.advanceTimersByTime(3000);

    resetTimerButton.click(); // Reset the timer

    // Verify reset
    expect(countdownElement.textContent).toBe("0:04"); // Timer should reset to initial time
  });

  it("toggles show/hide timer correctly", () => {
    // Check initial state
    expect(countdownElement.style.display).not.toBe("none"); // Timer is initially visible

    // Hide the timer
    showHideTimerButton.click();
    expect(countdownElement.style.display).toBe("none"); // Timer should now be hidden

    // Show the timer again
    showHideTimerButton.click();
    expect(countdownElement.style.display).not.toBe("none"); // Timer should now be visible again
  });

  it("alerts when time is up", () => {
    // Mock the window.alert function
    jest.spyOn(global, "alert").mockImplementation(() => {});

    startTimerButton.click(); // Start the timer

    // Advance time by the countdown period (e.g., 4 seconds for Easy)
    jest.advanceTimersByTime(4000);

    // Expect alert to be triggered when time is up
    expect(global.alert).toHaveBeenCalledWith("Time's up!"); // Check if alert was called

    // Restore the original alert function
    global.alert.mockRestore();
  });
});

describe("checkDifficulty Functionality", () => {
  let countdownElement;

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("correctly identifies the difficulty as Easy", () => {
    // Set up a mock DOM for "Easy"
    document.body.innerHTML = `
      <div class="flexlayout__tab">Hello, World!
        <div>1
          <div>2
            <div>3[0]</div>
            <div>3[1]
              <div>Easy</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const difficulty = checkDifficulty(); // Calls checkDifficulty function
    expect(difficulty).toBe("Easy"); // Check if it returns 'Easy'
  });

  it("sets the timer duration for Easy difficulty", () => {
    // Set up a mock DOM for "Easy"
    document.body.innerHTML = `
      <div class="flexlayout__tab">
        <div>1
          <div>2
            <div>3[0]</div>
            <div>3[1]
              <div>Easy</div>
            </div>
          </div>
        </div>
      </div>
    `;

    initializeTimer(); // Initialize timer based on the DOM setup

    // Get DOM elements
    countdownElement = document.getElementById("countdown");

    // Check if the timer duration is set to 4 seconds for Easy
    expect(countdownElement.textContent).toBe("0:04"); // Easy should be 0:04 (4 seconds)
  });

  it("sets the timer duration for Medium difficulty", () => {
    // Set up a mock DOM for "Medium"
    document.body.innerHTML = `
      <div class="flexlayout__tab">
        <div>1
          <div>2
            <div>3[0]</div>
            <div>3[1]
              <div>Medium</div>
            </div>
          </div>
        </div>
      </div>
    `;

    initializeTimer(); // Initialize timer based on the DOM setup

    // Get DOM elements
    countdownElement = document.getElementById("countdown");

    // Check if the timer duration is set to 40 minutes for Medium
    expect(countdownElement.textContent).toBe("40:00"); // Medium should be 40:00 (40 minutes)
  });

  it("sets the timer duration for Hard difficulty", () => {
    // Set up a mock DOM for "Hard"
    document.body.innerHTML = `
      <div class="flexlayout__tab">
        <div>1
          <div>2
            <div>3[0]</div>
            <div>3[1]
              <div>Hard</div>
            </div>
          </div>
        </div>
      </div>
    `;

    initializeTimer(); // Initialize timer based on the DOM setup

    // Get DOM elements
    countdownElement = document.getElementById("countdown");

    // Check if the timer duration is set to 60 minutes for Hard
    expect(countdownElement.textContent).toBe("60:00"); // Hard should be 60:00 (60 minutes)
  });
  it("Detects environment correctly", () => {
    expect(isESModuleSupported).toBe(true, "The environment should support ES modules");
  });
});
