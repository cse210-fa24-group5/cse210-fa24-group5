const puppeteer = require('puppeteer');
const path = require('path');
const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

describe('Chrome Extension Testing', () => {
  let browser;
  let page;
  let pages;
  const extensionPath = path.join(process.cwd(), 'src');
  const extensionId = 'hficpndipfpjdmkoigepjnedfbddbcdi';

  beforeAll(async () => {
    // Launch browser with extension loaded
    browser = await puppeteer.launch({
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox'
      ]
    });

  });

  beforeEach(async () => {
    // Open a new page
    pages = await browser.pages();
    page = pages[0];
    await page.goto(`chrome-extension://${extensionId}/hello.html`);
    await page.waitForSelector('img');
  });

  afterEach(async () => {
    // Close the page after each test
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  // TODO - Add your test cases here
  test('Image element is present in popup', async () => {  

    await page.evaluate(() => {
      chrome.action.openPopup(); 
    });

    const popupPage = pages.find(p => !p.isClosed() && p.url().includes('hello.html')); 

    const imageElement = await popupPage.$('img');
    expect(imageElement).toBeTruthy();
  });
});
