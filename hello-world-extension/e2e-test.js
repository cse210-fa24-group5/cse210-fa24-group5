const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      `--disable-extensions-except=D:/hello-world-extension`,
      `--load-extension=D:/hello-world-extension`
    ]
  });

  const pages = await browser.pages();
  const extensionPage = pages[0];

  await extensionPage.goto('chrome-extension://iipigcgobkpcppgdbpjfeidbhcfgbhba/popup.html');

  console.log(await extensionPage.content());

  await extensionPage.waitForSelector('#message', { timeout: 10000 });

  const text = await extensionPage.$eval('#message', el => el.textContent);
  console.log('Text content found:', text);

  if (text === 'Hello, World!') {
    console.log('E2E Test Passed: Text matches "Hello, World!"');
  } else {
    console.error('E2E Test Failed: Text does not match');
  }

  await browser.close();
})();
