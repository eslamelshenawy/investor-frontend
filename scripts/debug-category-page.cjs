const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const categoryUrl = 'https://open.data.gov.sa/ar/datasets?category=education_and_training';
  console.log(`Loading: ${categoryUrl}\n`);

  await page.goto(categoryUrl, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 5000));

  // Screenshot
  await page.screenshot({ path: 'category-page.png', fullPage: true });
  console.log('📸 Screenshot saved: category-page.png\n');

  // Get page info
  const info = await page.evaluate(() => {
    // Count various elements
    const allCards = document.querySelectorAll('.card');
    const articles = document.querySelectorAll('article');
    const allLinks = document.querySelectorAll('a[href*="dataset"]');

    // Get the main content area
    const mainContent = document.querySelector('main, .main-content, #content, .container');

    // Look for any text mentioning results
    const bodyText = document.body.innerText;
    const resultsMatch = bodyText.match(/(\d+)\s*(نتيجة|مجموعة|dataset|result)/i);

    // Find any list items that might be datasets
    const listItems = document.querySelectorAll('li, .list-item, .dataset-item');

    return {
      cards: allCards.length,
      articles: articles.length,
      datasetLinks: allLinks.length,
      listItems: listItems.length,
      resultsText: resultsMatch ? resultsMatch[0] : 'Not found',
      mainContentExists: !!mainContent,
      bodyTextSample: bodyText.substring(0, 500),
    };
  });

  console.log('📊 Page Analysis:');
  console.log(`   Cards: ${info.cards}`);
  console.log(`   Articles: ${info.articles}`);
  console.log(`   Dataset Links: ${info.datasetLinks}`);
  console.log(`   List Items: ${info.listItems}`);
  console.log(`   Results text: ${info.resultsText}`);
  console.log(`\n📝 Body text sample:\n${info.bodyTextSample}`);

  await browser.close();
})();
