const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Intercept requests to modify headers
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url();

    // Modify requests to API
    if (url.includes('/api/datasets/list') || url.includes('/api/datasets?')) {
      console.log(`📤 Intercepted: ${url}`);

      // Try to modify headers
      const headers = {
        ...request.headers(),
        'Accept': 'application/json',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-Requested-With': 'XMLHttpRequest',
      };

      request.continue({ headers });
    } else {
      request.continue();
    }
  });

  // Track responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/datasets')) {
      console.log(`📥 Response: ${response.status()} - ${url}`);
      try {
        const text = await response.text();
        console.log(`   Body: ${text.substring(0, 200)}`);

        if (!text.startsWith('<')) {
          fs.writeFileSync('api-response.json', text);
          console.log('   ✅ Saved to api-response.json');
        }
      } catch (e) {
        console.log(`   Error reading response: ${e.message}`);
      }
    }
  });

  console.log('Loading page with request interception...\n');
  await page.goto('https://open.data.gov.sa/ar/datasets', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  // Wait for potential API calls
  console.log('\nWaiting for API calls...');
  await new Promise((r) => setTimeout(r, 10000));

  await browser.close();
  console.log('\nDone.');
})();
