/**
 * Local test script
 * Run with: node test-local.js
 */

import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'apify';
import { extractPageData } from './src/extractors.js';
import { Router } from 'apify';
import fs from 'fs';

// Mock input for testing
const testInput = {
    startUrls: [
        { url: "https://www.facebook.com/337202632811202" }
    ],
    resultsType: "details",
    maxRequestsPerCrawl: 1,
    proxyConfiguration: {
        useApifyProxy: false, // Set to true if you have Apify proxy access
    },
    userData: {
        search_run_id: "test-run-" + Date.now()
    },
    scrapePosts: false,
    scrapeAbout: true,
    scrapeReviews: false,
    maxConcurrency: 1,
    pageLoadTimeoutSecs: 60,
    debugLog: true,
};

console.log('Starting local test...');
console.log('Input:', JSON.stringify(testInput, null, 2));

// Initialize Actor
await Actor.init();

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
} = testInput;

const router = Router.create();

router.addDefaultHandler(async ({ page, request, log }) => {
    log.info(`Processing ${request.url}`);

    try {
        await page.waitForLoadState('domcontentloaded', { timeout: pageLoadTimeoutSecs * 1000 });

        // Try to close popups
        try {
            const closeButtons = await page.locator('[aria-label*="Close"], [aria-label*="Fechar"], button:has-text("Not Now")').all();
            for (const button of closeButtons) {
                await button.click({ timeout: 2000 }).catch(() => {});
            }
        } catch (e) {
            // Ignore
        }

        // Scroll
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(2000);

        const pageData = await extractPageData(page, {
            url: request.url,
            scrapeAbout,
            scrapePosts,
            scrapeReviews,
            userData,
        });

        if (userData.search_run_id) {
            pageData.search_run_id = userData.search_run_id;
        }

        await Actor.pushData(pageData);

        console.log('\n=== EXTRACTED DATA ===');
        console.log(JSON.stringify(pageData, null, 2));

        log.info(`Successfully scraped ${pageData.title || request.url}`);

    } catch (error) {
        log.error(`Error processing ${request.url}: ${error.message}`);
        await Actor.pushData({
            facebookUrl: request.url,
            pageUrl: request.url,
            search_run_id: userData.search_run_id || null,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

const proxyConfig = proxyConfiguration.useApifyProxy
    ? await Actor.createProxyConfiguration(proxyConfiguration)
    : undefined;

const crawler = new PlaywrightCrawler({
    proxyConfiguration: proxyConfig,
    maxConcurrency,
    maxRequestsPerCrawl,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            headless: false, // Set to false to see the browser
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
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
            });
        },
    ],
    navigationTimeoutSecs: pageLoadTimeoutSecs,
    requestHandlerTimeoutSecs: pageLoadTimeoutSecs + 30,
});

const requests = startUrls.map((item) => {
    let url = typeof item === 'string' ? item : item.url;
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

console.log('\n=== TEST COMPLETE ===');
console.log('Check apify_storage/datasets/default/ for results');

await Actor.exit();
