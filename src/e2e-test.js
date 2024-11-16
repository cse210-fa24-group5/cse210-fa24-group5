const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      `--disable-extensions-except=./src`,  
      `--load-extension=./src` 
    ]
  });

  const pages = await browser.pages();
  const extensionPage = pages[0];

  await extensionPage.goto('chrome-extension://ebbfkpknlfillbolljanoijonahhiela/hello.html');

  await extensionPage.waitForSelector('h1', { timeout: 10000 });

  const text = await extensionPage.$eval('h1', el => el.textContent);
  console.log('Text content found:', text);

  if (text === 'Hello Extensions') {
    console.log('E2E Test Passed: Text matches "Hello Extensions"');
  } else {
    console.error('E2E Test Failed: Text does not match');
  }

  extensionPage.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i) {
      console.log(`${i}: ${msg.args()[i]}`);
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  await browser.close();
})();
