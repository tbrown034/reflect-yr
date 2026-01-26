import puppeteer from 'puppeteer';
import fs from 'fs';

const SCREENSHOT_DIR = '/Users/home/Desktop/dev/active/reflect-yr/test-screenshots';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`Screenshot saved: ${path}`);
  return path;
}

async function testPodcastFlow() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const page = await browser.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // Step 1: Navigate to create page
    console.log('\n=== STEP 1: Navigate to /create ===');
    await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2000);
    await takeScreenshot(page, '01-create-page');

    // Log what we see on the page
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Step 2: Click on Podcasts category
    console.log('\n=== STEP 2: Select Podcasts category ===');

    // Wait for page to fully render
    await sleep(1000);

    // Find and click the Podcasts option - look for it in buttons or links
    const clicked = await page.evaluate(() => {
      // Try to find Podcasts in any clickable element
      const elements = document.querySelectorAll('button, a, [role="button"], div[tabindex="0"]');
      for (const el of elements) {
        if (el.textContent.includes('Podcasts') || el.textContent.includes('Podcast')) {
          el.click();
          return { found: true, text: el.textContent.slice(0, 50) };
        }
      }
      return { found: false };
    });

    console.log('Podcast click result:', clicked);
    await sleep(1500);
    await takeScreenshot(page, '02-podcasts-selected');

    // Step 3: Search and add podcasts
    console.log('\n=== STEP 3: Search and add podcasts ===');

    const podcasts = ['Serial', 'The Daily', 'Huberman Lab', 'Smartless', 'Call Her Daddy', 'Crime Junkie'];

    for (let i = 0; i < podcasts.length; i++) {
      const podcast = podcasts[i];
      console.log(`\nSearching for: ${podcast}`);

      // Find search input
      const inputSelector = 'input[type="text"], input[type="search"], input[placeholder*="Search"]';
      await page.waitForSelector(inputSelector, { timeout: 5000 }).catch(() => {});

      const searchInput = await page.$(inputSelector);
      if (searchInput) {
        // Clear and type
        await searchInput.click({ clickCount: 3 });
        await searchInput.type(podcast, { delay: 50 });
        await sleep(2000); // Wait for search results

        await takeScreenshot(page, `03-search-${i + 1}-${podcast.replace(/\s/g, '-').toLowerCase()}`);

        // Find and click an add button - look for + or Add
        const added = await page.evaluate(() => {
          // Look for add buttons in search results
          const addButtons = document.querySelectorAll('button');
          for (const btn of addButtons) {
            const text = btn.textContent || '';
            const title = btn.title || '';
            const ariaLabel = btn.getAttribute('aria-label') || '';
            if (text.includes('+') || text.includes('Add') || title.includes('Add') || ariaLabel.includes('Add')) {
              // Skip if it's part of header
              if (!btn.closest('header') && !btn.closest('nav')) {
                btn.click();
                return { clicked: true, text: text.slice(0, 20) };
              }
            }
          }
          // Try clicking any result card
          const cards = document.querySelectorAll('article, [role="listitem"], .result-item');
          if (cards.length > 0) {
            cards[0].click();
            return { clicked: true, type: 'card' };
          }
          return { clicked: false };
        });

        console.log(`Add result for ${podcast}:`, added);
        await sleep(500);
      } else {
        console.log('ERROR: Could not find search input');
        // Log what inputs exist
        const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, placeholder: e.placeholder, name: e.name })));
        console.log('Available inputs:', inputs);
      }
    }

    await takeScreenshot(page, '04-podcasts-added');

    // Check current state of list
    const listState = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-list-item], .list-item, li');
      return { itemCount: items.length };
    });
    console.log('\nCurrent list state:', listState);

    // Step 4: Add ratings and notes
    console.log('\n=== STEP 4: Try to add ratings and notes ===');

    // Look for star rating components or edit buttons
    const ratingInfo = await page.evaluate(() => {
      const stars = document.querySelectorAll('[data-rating], .star, svg[data-star]');
      const editBtns = document.querySelectorAll('button[title*="edit"], button[aria-label*="edit"]');
      return { stars: stars.length, editButtons: editBtns.length };
    });
    console.log('Rating UI elements found:', ratingInfo);

    await takeScreenshot(page, '05-before-style');

    // Step 5: Find and click Next/Style button
    console.log('\n=== STEP 5: Proceed to Style stage ===');

    const nextClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a');
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('next') || text.includes('style') || text.includes('continue')) {
          btn.click();
          return { clicked: true, text: btn.textContent };
        }
      }
      // Also look for step indicators
      const steps = document.querySelectorAll('[data-step], .step');
      return { clicked: false, steps: steps.length };
    });

    console.log('Next button result:', nextClicked);
    await sleep(1500);
    await takeScreenshot(page, '06-style-stage');

    // Step 6: Pick a theme
    console.log('\n=== STEP 6: Pick a theme ===');

    const themeResult = await page.evaluate(() => {
      // Look for theme selectors
      const themes = document.querySelectorAll('[data-theme], .theme-option, [role="radio"], button[title*="theme"]');
      if (themes.length > 1) {
        themes[1].click();
        return { clicked: true, count: themes.length };
      }
      return { clicked: false, count: themes.length };
    });

    console.log('Theme selection result:', themeResult);
    await sleep(1000);
    await takeScreenshot(page, '07-theme-selected');

    // Step 7: Go to Preview
    console.log('\n=== STEP 7: Go to Preview ===');

    const previewClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a');
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('preview') || text.includes('next')) {
          btn.click();
          return { clicked: true, text: btn.textContent };
        }
      }
      return { clicked: false };
    });

    console.log('Preview button result:', previewClicked);
    await sleep(1500);
    await takeScreenshot(page, '08-preview');

    // Step 8: Click Share
    console.log('\n=== STEP 8: Click Share ===');

    const shareClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a');
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('share') || text.includes('publish') || text.includes('save')) {
          btn.click();
          return { clicked: true, text: btn.textContent };
        }
      }
      return { clicked: false };
    });

    console.log('Share button result:', shareClicked);
    await sleep(2000);
    await takeScreenshot(page, '09-after-share');

    // Check for share URL
    const finalState = await page.evaluate(() => {
      // Look for share URL in various places
      const urlInputs = document.querySelectorAll('input[readonly], input[value*="share"]');
      for (const input of urlInputs) {
        if (input.value.includes('share')) {
          return { shareUrl: input.value };
        }
      }
      // Check for any share code text
      const bodyText = document.body.textContent;
      const shareCodeMatch = bodyText.match(/[A-Za-z0-9]{6}/g);
      return {
        currentUrl: window.location.href,
        possibleShareCodes: shareCodeMatch ? shareCodeMatch.slice(0, 5) : []
      };
    });

    console.log('\nFinal state:', finalState);
    console.log('Current URL:', page.url());

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors ===');
      consoleErrors.forEach(err => console.log('ERROR:', err));
    }

  } catch (error) {
    console.error('\nTest error:', error.message);
    await takeScreenshot(page, 'error-state');
  }

  await browser.close();
  console.log('\n=== Test complete ===');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
}

testPodcastFlow();
