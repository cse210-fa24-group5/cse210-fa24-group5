/**
 * @jest-environment jsdom
 */
const { initializeTimer, checkDifficulty } = require('../../src/timer');

describe('Timer Functionality', () => {
    let countdownElement, startTimerButton, resetTimerButton, showHideTimerButton;
  
    beforeEach(() => {
      // Set up a mock DOM for timer tests
      document.body.innerHTML = `
        <div id="timer-overlay">
          <span id="countdown">100:00</span>
          <button id="startTimerButton">Start Timer</button>
          <button id="resetTimerButton">Reset Timer</button>
          <button id="showHideTimerButton">Hide Timer</button>
        </div>
      `;
  
      // Initialize the timer
      initializeTimer();
  
      // Get DOM elements
      countdownElement = document.getElementById('countdown');
      startTimerButton = document.getElementById('startTimerButton');
      resetTimerButton = document.getElementById('resetTimerButton');
      showHideTimerButton = document.getElementById('showHideTimerButton');
  
      // Use fake timers
      jest.useFakeTimers();
    });
  
    afterEach(() => {
      // Clear mocks and restore real timers
      jest.clearAllTimers();
      jest.useRealTimers();
      document.body.innerHTML = '';
    });
  
    it('counts down time correctly', () => {
      startTimerButton.click(); // Start the timer
  
      // Advance time by 1 minute (60 seconds)
      jest.advanceTimersByTime(60000);
  
      // Check the countdown display
      expect(countdownElement.textContent).toBe('99:00'); // Timer should decrement by 1 minute
    });
  
    it('resets the timer correctly', () => {
      startTimerButton.click(); // Start the timer
  
      // Advance time by 30 seconds
      jest.advanceTimersByTime(30000);
  
      resetTimerButton.click(); // Reset the timer
  
      // Verify reset
      expect(countdownElement.textContent).toBe('100:00'); // Timer should reset to initial time
    });
  
    it('toggles show/hide timer correctly', () => {
      // Check initial state
      expect(countdownElement.style.display).not.toBe('none'); // Timer is initially visible
  
      // Hide the timer
      showHideTimerButton.click();
      expect(countdownElement.style.display).toBe('none'); // Timer should now be hidden
  
      // Show the timer again
      showHideTimerButton.click();
      expect(countdownElement.style.display).not.toBe('none'); // Timer should now be visible again
    });
  });

describe('checkDifficulty Functionality', () => {
  beforeEach(() => {
    // Set up a mock DOM for checkDifficulty tests
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
  });

  it('correctly identifies the difficulty from the DOM', () => {
    const difficulty = checkDifficulty();
    expect(difficulty).toBe('Easy'); // Ensure it fetches the correct difficulty
  });
});