const path = require('path');
const puppeteer = require('puppeteer');

(async () => {

  const extensionPath = __dirname;
  console.log('Extension path:', extensionPath); 

  const browser = await puppeteer.launch({
    headless: true, 
    executablePath: '/usr/bin/google-chrome',
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const extensionId = 'ebbfkpknlfillbolljanoijonahhiela'; 
  const extensionPageUrl = `chrome-extension://${extensionId}/hello.html`;

  const page = await browser.newPage();
  console.log('Navigating to:', extensionPageUrl);

  await page.goto(extensionPageUrl);


  await page.waitForSelector('img', { timeout: 10000 });

  const imgSrc = await page.$eval('img', img => img.getAttribute('src'));
  console.log('Image src found:', imgSrc);

  if (imgSrc === 'HomePage.png') {
    console.log('E2E Test Passed: Image src matches "HomePage.png"');
  } else {
    console.error('E2E Test Failed: Image src does not match');
  }


  page.on('console', msg => {
    console.log('Console log from extension:', msg.text());
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  await browser.close();
})();
