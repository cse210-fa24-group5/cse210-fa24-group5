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

// Helper function to simulate delay
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("To-Do List Functionality with LeetCode Timer Extension", () => {
  let browser;
  let pages;
  let page;
  let extensionPage;
  let extensionId;

  const extensionPath = path.join(process.cwd(), "src");

  beforeAll(async () => {
    // Launch browser with extension loaded
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--no-sandbox",
      ],
    });

    // Get the extension id
    pages = await browser.pages();
    page = pages[0];
    await page.goto("chrome://extensions/");
    await page.waitForSelector("extensions-manager");

    // enable developer mode
    await page.evaluate(() => {
      document
        .querySelector("extensions-manager")
        .shadowRoot.querySelector("extensions-toolbar")
        .shadowRoot.querySelector("cr-toggle")
        .click();
    });

    // grab the extension id from textContent within first div that has id "extension-id"
    const extensionName = "LeetCode Task Manager";
    extensionId = await page.evaluate((extensionName) => {
      const extensions = document
        .querySelector("extensions-manager")
        .shadowRoot.querySelector("extensions-item-list")
        .shadowRoot.querySelectorAll("extensions-item");
      const extension = Array.from(extensions).find((e) =>
        e.shadowRoot.querySelector("div").textContent.includes(extensionName),
      );
      return extension.getAttribute("id");
    }, extensionName);
  });

  beforeEach(async () => {
  });

  afterEach(async () => {
    // Close the extension page after each test
    if (extensionPage) {
      await extensionPage.close();
    }
  });

  afterAll(async () => {
    await browser.close();
  });

  test("Clicking the plus button adds the problem to the To-Do list", async () => {
    // Navigate to LeetCode problem page
    pages = await browser.pages();
    page = pages[0];
    await page.goto("https://leetcode.com/problems/two-sum/description/", {
      waitUntil: "domcontentloaded",
    });

    // Wait for the add-to-do button to load
    await page.waitForSelector(".add-todo-btn");

    // Click the plus button on the LeetCode problem page
    await page.click(".add-todo-btn");

    // Wait for the extension page to reflect the change
    await timeout(2000);
    extensionPage = await browser.newPage(); // Initialize extensionPage as a new page
    await extensionPage.goto(`chrome-extension://${extensionId}/hello.html`, {
      waitUntil: "domcontentloaded",
    });
    const todoListSelector = "#todo-list";
    await extensionPage.waitForSelector(todoListSelector);

    // Extract and verify the To-Do list items
    const todoItems = await extensionPage.$$eval(`${todoListSelector} > li`, (listItems) =>
      listItems.map((item) => {
        const button = item.querySelector(".problem-button");
        const spans = button ? button.querySelectorAll("span") : [];
        return {
          number: spans[0]?.textContent || "",
          title: spans[1]?.textContent || "",
          difficulty: spans[2]?.textContent || "",
        };
      })
    );

    // Check if the problem is added to the To-Do list
    const problemExists = todoItems.some(
      (item) =>
        item.number === "1" &&
        item.title === "Two Sum" &&
        item.difficulty === "Easy"
    );

    expect(problemExists).toBe(true);
    // Click on the problem link in the To-Do list to verify navigation
    // const problemLinkSelector = `${todoListSelector} > li .problem-button`;
    // await extensionPage.click(problemLinkSelector);
    // const targets = await browser.targets();
    // const newPageTarget = targets.find(target => target.type() === 'page' && target.url().includes('two-sum'));
    // expect(newPageTarget).toBeDefined();
    browser.on('targetcreated', async target => {
      const newPage = await target.page();
      const currentUrl = newPage.url();
      expect(currentUrl).toBe("https://leetcode.com/problems/two-sum/description/");
    });

    // Click on the problem button to open it in a new tab
    const problemLinkSelector = `${todoListSelector} > li .problem-button`;
    await extensionPage.click(problemLinkSelector);
  }, 15000);
});
