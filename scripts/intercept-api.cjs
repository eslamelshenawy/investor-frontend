const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Collect all API requests
  const apiRequests = [];

  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    // Only track JSON responses
    if (contentType.includes('json') || url.includes('api')) {
      try {
        const text = await response.text();
        apiRequests.push({
          url,
          status: response.status(),
          size: text.length,
          preview: text.substring(0, 200),
        });
      } catch {
        apiRequests.push({ url, status: response.status(), error: 'Could not read' });
      }
    }
  });

  console.log('Loading page and capturing API calls...\n');
  await page.goto('https://open.data.gov.sa/ar/datasets', { waitUntil: 'networkidle2' });

  // Wait for additional dynamic content
  await new Promise(r => setTimeout(r, 5000));

  // Scroll to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 3000));

  console.log(`📡 Captured ${apiRequests.length} API requests:\n`);

  apiRequests.forEach((req, i) => {
    console.log(`${i + 1}. ${req.url}`);
    console.log(`   Status: ${req.status}, Size: ${req.size || 'N/A'}`);
    if (req.preview && req.preview.length > 10) {
      console.log(`   Preview: ${req.preview.substring(0, 100)}...`);
    }
    console.log();
  });

  // Save full details
  fs.writeFileSync('api-requests.json', JSON.stringify(apiRequests, null, 2));
  console.log('💾 Saved to api-requests.json');

  await browser.close();
})();
