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

// Structured logging
const log = (level, message, meta = {}) => {
    console.log(JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta
    }));
};

log('info', 'Starting Facebook Page Scraper', {
    totalUrls: startUrls.length,
    maxConcurrency,
    maxRetries,
    proxyEnabled: proxyConfiguration?.useApifyProxy || false
});

const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);

const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, request, log: crawlerLog }) => {
    const startTime = Date.now();

    log('info', 'Processing page', {
        url: request.url,
        retryCount: request.retryCount
    });

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

        const duration = Date.now() - startTime;
        log('success', 'Page scraped successfully', {
            url: request.url,
            title: pageData.title,
            durationMs: duration,
            dataFields: Object.keys(pageData).length
        });

    } catch (error) {
        const duration = Date.now() - startTime;

        log('error', 'Error processing page', {
            url: request.url,
            error: error.message,
            errorStack: error.stack,
            durationMs: duration,
            retryCount: request.retryCount
        });

        // Push partial data with error
        await Actor.pushData({
            facebookUrl: request.url,
            pageUrl: request.url,
            search_run_id: userData.search_run_id || null,
            error: error.message,
            timestamp: new Date().toISOString(),
        });

        // Re-throw to trigger retry if maxRetries not reached
        throw error;
    }
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration: proxyConfig,
    maxConcurrency,
    maxRequestsPerCrawl,
    requestHandler: router,

    // ✅ Session pool for browser reuse
    useSessionPool: true,
    persistCookiesPerSession: false, // Public pages don't need cookies

    // ✅ Retry logic
    maxRequestRetries: maxRetries,

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

    // ✅ Failure handling
    failedRequestHandler: async ({ request }, error) => {
        log('error', 'Request failed after retries', {
            url: request.url,
            error: error.message,
            retryCount: request.retryCount
        });
    },
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

// Get final statistics
const stats = await crawler.stats;
log('info', 'Scraping completed', {
    totalRequests: requests.length,
    crawlerStats: stats
});

await Actor.exit();
