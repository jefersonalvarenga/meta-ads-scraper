import { Actor } from 'apify';
import { PlaywrightCrawler, createPlaywrightRouter } from 'crawlee';
import { extractPageData } from './extractors.js';

await Actor.init();

const input = await Actor.getInput();
const {
    startUrls = [],
    resultsType = 'details',
    maxRequestsPerCrawl = 10,
    proxyConfiguration,
    userData = {},
    scrapePosts = false,
    scrapeAbout = true,
    scrapeReviews = false,
    maxConcurrency = 5,
    pageLoadTimeoutSecs = 60,
    debugLog = false,
    maxRetries = 2,
} = input;

if (!startUrls || startUrls.length === 0) {
    throw new Error('No start URLs provided');
}

if (debugLog) {
    await Actor.setLogLevel('DEBUG');
}

console.log(`Starting Facebook Page Scraper with ${startUrls.length} URLs`);

const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);

const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, request }) => {
    try {
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded', { timeout: pageLoadTimeoutSecs * 1000 });

        // Try to close any popups/modals
        try {
            const closeButtons = await page.locator('[aria-label*="Close"], [aria-label*="Fechar"], button:has-text("Not Now")').all();
            for (const button of closeButtons) {
                await button.click({ timeout: 2000 }).catch(() => {});
            }
        } catch (e) {
            // Ignore errors closing popups
        }

        // Scroll to load more content
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(2000);

        // Extract page data
        const pageData = await extractPageData(page, {
            url: request.url,
            scrapeAbout,
            scrapePosts,
            scrapeReviews,
            userData,
        });

        // Add search_run_id from userData if provided
        if (userData.search_run_id) {
            pageData.search_run_id = userData.search_run_id;
        }

        await Actor.pushData(pageData);

    } catch (error) {

        // Push partial data with error (only on final failure)
        if (request.retryCount >= maxRetries) {
            await Actor.pushData({
                facebookUrl: request.url,
                pageUrl: request.url,
                search_run_id: userData.search_run_id || null,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        } else {
            // Re-throw to trigger retry
            throw error;
        }
    }
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration: proxyConfig,
    maxConcurrency,
    maxRequestsPerCrawl,
    requestHandler: router,
    maxRequestRetries: maxRetries,
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },
    navigationTimeoutSecs: pageLoadTimeoutSecs,
    requestHandlerTimeoutSecs: pageLoadTimeoutSecs + 20,
});

// Prepare requests
const requests = startUrls.map((item) => {
    let url = typeof item === 'string' ? item : item.url;

    // Normalize URL
    if (!url.startsWith('http')) {
        url = `https://www.facebook.com/${url}`;
    }

    return {
        url,
        userData: {
            label: 'PAGE',
        },
    };
});

await crawler.run(requests);

await Actor.exit();
