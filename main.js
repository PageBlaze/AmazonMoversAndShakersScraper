const Apify = require('apify');

Apify.main(async () => {
    // Open request queue and add start URL
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: 'https://www.amazon.com/gp/movers-and-shakers/electronics',
        userData: { label: 'START' }
    });

    // Create PuppeteerCrawler instance
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        useSessionPool: true,
        persistCookiesPerSession: true,

        handlePageFunction: async ({ request, page }) => {
            const { label } = request.userData;

            if (label === 'START' || label === 'PAGE') {
                console.log(`Processing page: ${request.url}`);

                // Wait until product list is loaded
                await page.waitForSelector('#zg-center-div .zg-item', { timeout: 60000 });

                // Extract items
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

                // Save data
                await Apify.pushData(results);

                // Check for next page and enqueue
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

        maxRequestsPerCrawl: 2, // Only 2 pages expected
        maxConcurrency: 1,
    });

    // Run crawler
    await crawler.run();
});
