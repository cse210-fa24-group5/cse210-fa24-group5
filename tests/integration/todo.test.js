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

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("To-Do List Functionality with LeetCode Timer Extension", () => {
  let browser;
  let pages;
  let page;
  let extensionId;
  let todoListSelector;

  const extensionPath = path.join(process.cwd(), "src");

  beforeAll(async () => {
    // Launch browser with extension loaded
    browser = await puppeteer.launch({
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--window-size=1920,1080",
      ],
      defaultViewport: null,
    });
    // Get the extension id
    pages = await browser.pages();
    page = pages[0];
    const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    });
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
    console.log("Extension loaded with ID:", extensionId);
  });

  beforeEach(async () => {
    //Clicking the plus button adds the problem to the To-Do list
    // Navigate to LeetCode problem page
    pages = await browser.pages();
    page = pages[0]; // Ensure a fresh page is initialized
    const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    });
    console.log("Navigating to LeetCode problem page...");
    await page.goto("https://leetcode.com/problems/two-sum/description/", {
      waitUntil: "domcontentloaded",
    });

    console.log("Waiting for add-to-do button...");
    await timeout(5000);
    await page.waitForSelector(".add-todo-btn");
    console.log( "Got the add-to-do button... ");
    console.log("Clicking the add-to-do button...");
    await page.click(".add-todo-btn");

    await timeout(2000);
    console.log("Opening extension page...");
    // extensionPage = await browser.newPage();// Initialize extensionPage as a new page 
    await page.goto(`chrome-extension://${extensionId}/hello.html`, {
      waitUntil: "domcontentloaded",
    });
    console.log("Waiting for #todo-list");
    todoListSelector = "#todo-list";
    await page.waitForSelector(todoListSelector);
  }, 15000);

  afterEach(async () => {
    // Close the extension page after each test
    const pages = await browser.pages();
    for (const openPage of pages) {
    if (!(await openPage.isClosed())) {
      await openPage.close(); // Close each open page
      }
    }
  });

  afterAll(async () => {
    await browser.close();
  });

  test("dummy", async () => {
    console.log("This is a dummy test");
    let a = 1;
    expect(a).toBe(1);
  });

  test("Clicking the problem in the list opens the problem", async () => {
    // Extract and verify the To-Do list items
    console.log("Extract and verify the To-Do list items")
    const todoItems = await page.$$eval(
      `${todoListSelector} > li`,
      (listItems) =>
        listItems.map((item) => {
          const button = item.querySelector(".problem-button");
          const spans = button ? button.querySelectorAll("span") : [];
          return {
            number: spans[0]?.textContent || "",
            title: spans[1]?.textContent || "",
            difficulty: spans[2]?.textContent || "",
          };
        }),
    );

    // Check if the problem is added to the To-Do list
    console.log("Check if the problem is added to the To-Do list")
    const problemExists = todoItems.some(
      (item) =>
        item.number === "1" &&
        item.title === "Two Sum" &&
        item.difficulty === "Easy",
    );

    expect(problemExists).toBe(true);
    const newPagePromise = new Promise((resolve) => {
      browser.once("targetcreated", async (target) => {
        const newPage = await target.page();
        resolve(newPage);
      });
    });

    // Click on the problem button to open it in a new tab
    console.log("Click on the problem button to open it in a new tab");
    const problemLinkSelector = `${todoListSelector} > li .problem-button`;
    await page.click(problemLinkSelector);

    const newPage = await newPagePromise;
    const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
    await newPage.setUserAgent(userAgent);
    await newPage.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    });
    await timeout(2000);
    await newPage.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Verify the URL of the new page
    console.log("Verify the URL of the new page");
    const currentUrl = newPage.url();
    expect(currentUrl).toBe("https://leetcode.com/problems/two-sum/");
    await newPage.close();
  }, 10000);

  test("Clicking the remove button in the list removes the problem from the list", async () => {
    const removeButtonSelector = `${todoListSelector} > li .remove-button`;
    await page.click(removeButtonSelector);

    // Wait for the change in the To-Do list
    console.log("Wait for the change in the To-Do list")
    await page.waitForSelector(todoListSelector);

    // Verify the problem is removed from the To-Do list
    console.log("Verify the problem is removed from the To-Do list")
    const updatedTodoItems = await page.$$eval(
      `${todoListSelector} > li`,
      (listItems) =>
        listItems.map((item) => {
          const button = item.querySelector(".problem-button");
          const spans = button ? button.querySelectorAll("span") : [];
          return {
            number: spans[0]?.textContent || "",
            title: spans[1]?.textContent || "",
            difficulty: spans[2]?.textContent || "",
          };
        }),
    );

    const problemStillExists = updatedTodoItems.some(
      (item) =>
        item.number === "1" &&
        item.title === "Two Sum" &&
        item.difficulty === "Easy",
    );

    expect(problemStillExists).toBe(false);
  }, 10000);
});
