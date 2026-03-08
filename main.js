// main.js
import { PuppeteerCrawler, Dataset, RequestQueue } from 'crawlee';
import { Actor } from 'apify';

// Initialize Actor (needed for Apify platform integration)
await Actor.init();

// Open a request queue
const requestQueue = await RequestQueue.open();

// Add start URL
await requestQueue.addRequest({
    url: 'https://www.amazon.com/gp/movers-and-shakers/electronics',
    userData: { label: 'START' }
});

// Create the PuppeteerCrawler
const crawler = new PuppeteerCrawler({
    requestQueue,
    useSessionPool: true,
    persistCookiesPerSession: true,

    async requestHandler({ request, page }) {
        const { label } = request.userData;

        if (label === 'START' || label === 'PAGE') {
            console.log(`Processing page: ${request.url}`);

            // Wait until product items load
            await page.waitForSelector('#zg-center-div .zg-item', { timeout: 60000 });

            const results = await page.evaluate(() => {
                const items = [];

                document.querySelectorAll('.zg-item').forEach((el) => {
                    const rankChangeElement = el.querySelector('.zg-badge-text');
                    const rankChange = rankChangeElement ? rankChangeElement.innerText.trim() : null;

                    const titleElement = el.querySelector('.p13n-sc-truncated');
                    const title = titleElement ? titleElement.innerText.trim() : '';

                    const priceElement = el.querySelector('.p13n-sc-price');
                    const price = priceElement ? priceElement.innerText.trim() : '';

                    const linkElement = el.querySelector('a.a-link-normal');
                    const link = linkElement ? 'https://www.amazon.com' + linkElement.getAttribute('href') : '';

                    if (title && link) {
                        items.push({ rankChange, title, price, link });
                    }
                });

                return items;
            });

            // Save scraped data
            await Dataset.pushData(results);

            // Look for "Next" button and enqueue next page
            const nextPageUrl = await page.evaluate(() => {
                const nextButton = Array.from(document.querySelectorAll('li.a-last a')).find(a =>
                    a.innerText.includes('Next')
                );
                return nextButton ? nextButton.href : null;
            });

            if (nextPageUrl) {
                await requestQueue.addRequest({
                    url: nextPageUrl,
                    userData: { label: 'PAGE' }
                });
            }
        }
    },

    // Limit to 2 pages max
    maxRequestsPerCrawl: 2,
    maxConcurrency: 1,
});

// Run the crawler
await crawler.run();

// Gracefully exit Actor
await Actor.exit();
