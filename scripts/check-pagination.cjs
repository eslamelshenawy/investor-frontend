const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  console.log('Loading page...');
  await page.goto('https://open.data.gov.sa/ar/datasets', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000)); // Wait for JS

  // Get page structure
  const info = await page.evaluate(() => {
    // Get all links
    const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim().substring(0, 50),
      href: a.getAttribute('href'),
      class: a.className,
    })).filter(l => l.href && l.href.includes('dataset'));

    // Get all cards HTML
    const cards = document.querySelectorAll('.card');
    const cardDetails = Array.from(cards).slice(0, 2).map(c => ({
      html: c.outerHTML.substring(0, 500),
      links: Array.from(c.querySelectorAll('a')).map(a => a.getAttribute('href')),
    }));

    // Check for React/Vue app
    const hasReact = !!document.querySelector('#root, #app, [data-reactroot]');
    const hasVue = !!document.querySelector('[data-v-]');

    return {
      linkCount: allLinks.length,
      sampleLinks: allLinks.slice(0, 5),
      cardCount: cards.length,
      cardDetails,
      hasReact,
      hasVue,
    };
  });

  console.log('\n📊 Page Analysis:');
  console.log(`Cards: ${info.cardCount}`);
  console.log(`Dataset links: ${info.linkCount}`);
  console.log(`React: ${info.hasReact}, Vue: ${info.hasVue}`);

  console.log('\n🔗 Sample links:');
  info.sampleLinks.forEach(l => console.log(`   ${l.href}`));

  console.log('\n📝 Card structure:');
  if (info.cardDetails[0]) {
    console.log(info.cardDetails[0].html.substring(0, 300));
    console.log('Links in card:', info.cardDetails[0].links);
  }

  // Save full HTML for analysis
  const html = await page.content();
  fs.writeFileSync('page-debug.html', html);
  console.log('\n💾 Full page saved to page-debug.html');

  await browser.close();
})();
