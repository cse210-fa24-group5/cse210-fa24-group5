const puppeteer = require('puppeteer');
const path = require('path');
const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

describe('Chrome Extension Testing', () => {
  let browser;
  let page;
  let pages;
  let extensionId;
  const extensionPath = path.join(process.cwd(), 'src');

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

    // Get the extension id
    pages = await browser.pages();
    page = pages[0];
    await page.goto('chrome://extensions/');
    await page.waitForSelector('extensions-manager');

    // enable developer mode
    await page.evaluate(() => {
      document.querySelector('extensions-manager').shadowRoot.querySelector('extensions-toolbar').shadowRoot.querySelector('cr-toggle').click();
    });
    
    // grab the extension id from textContent within first div that has id "extension-id"
    const extensionName = 'Hello Extensions';
    extensionId = await page.evaluate((extensionName) => {
      const extensions = document.querySelector('extensions-manager').shadowRoot.querySelector('extensions-item-list').shadowRoot.querySelectorAll('extensions-item');
      const extension = Array.from(extensions).find(e => e.shadowRoot.querySelector('div').textContent.includes(extensionName));
      return extension.getAttribute('id');
    }, extensionName);
  });

  beforeEach(async () => {
    // page = browser.newPage();
    pages = await browser.pages();
    page = pages[0];
    page.goto(`chrome-extension://${extensionId}/hello.html`);
    // Navigate to the extension's popup
  }, 1000000000);

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
    await page.waitForSelector('img');

    const popupPage = pages.find(p => !p.isClosed() && p.url().includes('hello.html')); 

    const imageElement = await popupPage.$('img');
    expect(imageElement).toBeTruthy();
  });
});
