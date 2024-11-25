const puppeteer = require('puppeteer');
const path = require('path');
const { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } = require('@jest/globals');

// Simple timeout to wait for actions to process especially for time to countdown
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('LeetCode Timer Overlay Testing', () => {
  let browser;
  let page;
  let pages;
  const extensionPath = path.join(process.cwd(), 'src');  // Path to extension

  beforeAll(async () => {
    // Launch browser with extension loaded
    browser = await puppeteer.launch({
      headless: false,  // Set to true for headless, false to view the browser
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox'
      ]
    });

    // Get the extension id
    pages = await browser.pages();
    page = pages[0];

    // Go to the specific LeetCode problem page
    await page.goto('https://leetcode.com/problems/two-sum/description/', {
      waitUntil: 'domcontentloaded',
    });

    // Wait for timer overlay to appear
    await page.waitForSelector('#timer-overlay');
  }, 7000);

  beforeEach(async () => {
    // Optionally you can clear any previous state here
  });

  afterEach(async () => {
    // Optionally close any pages or clear session after each test
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Timer is present on LeetCode problem page', async () => {
    // Check if the timer element is present on the page
    const timerExists = await page.$('#timer-overlay') !== null;
    expect(timerExists).toBe(true);  // The timer overlay should be on the page
  });

  test('Timer countdown starts correctly on LeetCode problem page', async () => {
    // Click the start button on the timer
    await page.click('#startTimerButton');
    await timeout(1000);

    // Check if the countdown value has changed (timer should start decreasing)
    const countdownText = await page.$eval('#countdown', el => el.textContent);
    expect(countdownText).not.toBe('0:04');  // Assuming the timer started with 04:00
  });

  test('Timer resets correctly on LeetCode problem page', async () => {
    // Start the timer first
    await page.click('#startTimerButton');
    await timeout(2000);

    // Now click the reset button
    await page.click('#resetTimerButton');

    // Verify the timer has reset to the default value (e.g., '0:04')
    const countdownText = await page.$eval('#countdown', el => el.textContent);
    expect(countdownText).toBe('0:04');
  });

  test('Timer hides and shows on LeetCode problem page', async () => {
    // Check if the timer is visible initially
    const isVisibleBefore = await page.$eval('#countdown', el => window.getComputedStyle(el).display === 'block');
    expect(isVisibleBefore).toBe(true);

    // Click the hide button to hide the timer
    await page.click('#showHideTimerButton');

    // Check if the timer is now hidden
    const isVisibleAfterHide = await page.$eval('#countdown', el => window.getComputedStyle(el).display === 'none');
    expect(isVisibleAfterHide).toBe(true);

    // Click the show button to reveal the timer again
    await page.click('#showHideTimerButton');

    // Check if the timer is visible again
    const isVisibleAfterShow = await page.$eval('#countdown', el => window.getComputedStyle(el).display === 'block');
    expect(isVisibleAfterShow).toBe(true);
  });
  test('Timer triggers alert when reaching zero', async () => {
    // Set up a listener for the alert dialog
    let alertMessage = null;
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.dismiss(); // Dismiss the alert to avoid blocking the test
    });

    // Start timer
     await page.evaluate(() => {
        // Start the timer
        document.getElementById('startTimerButton').click();
    });
    
    // Wait for timer to countdown to 0
    await timeout(4200)

    // Check if the alert appears
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Time is up!'); // Assuming the alert says "Time is up!"
      await dialog.dismiss();
    });

    // Verify that the alert message is correct
    expect(alertMessage).toBe('Time\'s up!'); // Replace with the actual alert message in your code
  }, 10000);
});
