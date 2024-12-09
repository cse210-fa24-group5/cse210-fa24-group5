const puppeteer = require("puppeteer");
const path = require("path");
const {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} = require("@jest/globals");

// Simple timeout to wait for actions to process, especially for time countdowns
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("LeetCode Timer Overlay Testing", () => {
  let browser;
  let page;
  const extensionPath = path.join(process.cwd(), "src");

  beforeAll(
    async () => {
      // Launch browser with extension loaded
      browser = await puppeteer.launch({
        headless: true, // Set to false to view the browser
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
          "--no-sandbox",
        ],
      });

       // Get the extension id
      const pages = await browser.pages();
      page = pages[0];

      // Go to the specific LeetCode problem page
      await page.goto("https://leetcode.com/problems/two-sum/description/", {
        waitUntil: "domcontentloaded",
      });

      // Wait for timer overlay to appear
      await page.waitForSelector("#timer-overlay");
    },
    15000 // Ensure adequate timeout for setup
  );

  beforeEach(
    async () => {
      // Optionally you can clear any previous state here
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector("#timer-overlay");
    },
    10000
  );

  afterEach(async () => {
    // Optionally close any pages or clear session after each test
    await page.evaluate(() => {
      window.localStorage.clear();
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test(
    "Timer is present on LeetCode problem page",
    async () => {
      // Check if the timer element is present on the page
      const timerExists = await page.$("#timer-overlay");
      expect(timerExists).not.toBeNull();
    },
    10000
  );

  test(
    "Timer countdown starts correctly on LeetCode problem page",
    async () => {
      // Click the start button on the timer
      await page.click("#startTimerButton");
      await timeout(1000);

      // Check if the countdown value has changed (timer should start decreasing)
      const countdownText = await page.$eval(
        "#countdown",
        (el) => el.textContent
      );
      expect(countdownText).not.toBe("0:04"); // Assuming the timer started at 0:04
    },
    10000
  );

  test("Timer resets correctly on LeetCode problem page", async () => {
    // Start the timer first
    await page.click("#startTimerButton");
    await timeout(2000);

    // Now click the reset button
    await page.click("#resetTimerButton");

    // Verify the timer has reset to the default value (e.g., '0:04')
    const countdownText = await page.$eval(
      "#countdown",
      (el) => el.textContent
    );
    expect(countdownText).toBe("0:04");
  });

  test("Timer hides and shows on LeetCode problem page", async () => {
    // Check if the timer is visible initially
    const isVisibleBefore = await page.$eval(
      "#countdown",
      (el) => window.getComputedStyle(el).display === "block"
    );
    expect(isVisibleBefore).toBe(true);

    // Click the hide button to hide the timer
    await page.click("#showHideTimerButton");

    // Check if the timer is now hidden
    const isVisibleAfterHide = await page.$eval(
      "#countdown",
      (el) => window.getComputedStyle(el).display === "none"
    );
    expect(isVisibleAfterHide).toBe(true);

    // Click the show button to reveal the timer again
    await page.click("#showHideTimerButton");

    // Check if the timer is visible again
    const isVisibleAfterShow = await page.$eval(
      "#countdown",
      (el) => window.getComputedStyle(el).display === "block"
    );
    expect(isVisibleAfterShow).toBe(true);
  });

  
  

  test(
    "Submitting timer settings shows 'Settings Saved!' alert",
    async () => {
      let alertHandled = false;
      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Settings Saved!");
        alertHandled = true;
        await dialog.dismiss();
      });

      await page.click("#settingPageButton");
      await page.click("#submitSettingButton");

      expect(alertHandled).toBe(true);
    },
    10000
  );

  test(
    "Timer triggers alert when reaching zero",
    async () => {
      let alertMessage = null;
      page.once("dialog", async (dialog) => {
        alertMessage = dialog.message();
        await dialog.dismiss();
      });

      await page.evaluate(() => {
        document.getElementById("startTimerButton").click();
      });

      await timeout(4200);
      expect(alertMessage).toBe("Time's up!");
    },
    10000
  );
});
