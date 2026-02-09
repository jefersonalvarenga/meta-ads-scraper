import { Actor } from 'apify';
import { PlaywrightCrawler } from 'apify';
import { extractPageData } from './extractors.js';
import { Router } from 'apify';

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
} = input;

if (!startUrls || startUrls.length === 0) {
    throw new Error('No start URLs provided');
}

if (debugLog) {
    Actor.log.setLevel(Actor.log.LEVELS.DEBUG);
}

Actor.log.info(`Starting Facebook Page Scraper with ${startUrls.length} URLs`);

const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);

const router = Router.create();

router.addDefaultHandler(async ({ page, request, log }) => {
    log.info(`Processing ${request.url}`);

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
        log.info(`Successfully scraped ${pageData.title || request.url}`);

    } catch (error) {
        log.error(`Error processing ${request.url}: ${error.message}`);

        // Push partial data with error
        await Actor.pushData({
            facebookUrl: request.url,
            pageUrl: request.url,
            search_run_id: userData.search_run_id || null,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration: proxyConfig,
    maxConcurrency,
    maxRequestsPerCrawl,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-sandbox',
            ],
        },
    },
    preNavigationHooks: [
        async ({ page }) => {
            // Set user agent and other fingerprinting properties
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
            });
        },
    ],
    navigationTimeoutSecs: pageLoadTimeoutSecs,
    requestHandlerTimeoutSecs: pageLoadTimeoutSecs + 30,
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
