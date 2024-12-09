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
  let extensionPage;
  let extensionId;
  let todoListSelector;

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
    //Clicking the plus button adds the problem to the To-Do list
    // Navigate to LeetCode problem page
    pages = await browser.pages();
    page = pages[0];
    await page.goto("https://leetcode.com/problems/two-sum/description/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(".add-todo-btn");
    await page.click(".add-todo-btn");

    await timeout(2000);
    extensionPage = await browser.newPage(); // Initialize extensionPage as a new page
    await extensionPage.goto(`chrome-extension://${extensionId}/hello.html`, {
      waitUntil: "domcontentloaded",
    });
    todoListSelector = "#todo-list";
    await extensionPage.waitForSelector(todoListSelector);
  }, 15000);

  afterEach(async () => {
    // Close the extension page after each test
    if (extensionPage) {
      await extensionPage.close();
    }
  });

  afterAll(async () => {
    await browser.close();
  });

  test("Clicking the problem in the list opens the problem", async () => {
    // Extract and verify the To-Do list items
    const todoItems = await extensionPage.$$eval(
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
    const problemExists = todoItems.some(
      (item) =>
        item.number === "1" &&
        item.title === "Two Sum" &&
        item.difficulty === "Easy",
    );

    expect(problemExists).toBe(true);
    const newPagePromise = new Promise((resolve) => {
      const handleTargetCreated = async (target) => {
        const newPage = await target.page();
        if (newPage) {
          resolve(newPage);
          browser.off("targetcreated", handleTargetCreated);
        }
      };
      browser.once("targetcreated", handleTargetCreated);
    });

    // Click on the problem button
    const problemLinkSelector = `${todoListSelector} > li .problem-button`;
    await extensionPage.click(problemLinkSelector);

    const newPage = await newPagePromise;
    await newPage.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Verify the URL of the new page
    const currentUrl = newPage.url();
    expect(currentUrl).toBe("https://leetcode.com/problems/two-sum/");
    await newPage.close();
  }, 5000);

  test("Clicking the remove button in the list removes the problem from the list", async () => {
    const removeButtonSelector = `${todoListSelector} > li .remove-button`;
    await extensionPage.click(removeButtonSelector);

    // Wait for the change in the To-Do list
    await timeout(2000);

    // Verify the problem is removed from the To-Do list
    const updatedTodoItems = await extensionPage.$$eval(
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
  }, 5000);
});
