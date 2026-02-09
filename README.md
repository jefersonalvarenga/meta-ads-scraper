# Facebook Page Scraper

This Apify actor scrapes Facebook pages and extracts detailed information including:

- Page title and category
- Likes and followers count
- Contact information (phone, websites)
- Ratings and reviews count
- Profile picture URL
- Ad library status
- And more...

## Input

The actor accepts the following input parameters:

- **startUrls** (required): Array of Facebook page URLs to scrape
- **resultsType**: Type of results to return (details or basic)
- **maxRequestsPerCrawl**: Maximum number of pages to scrape
- **proxyConfiguration**: Proxy settings (recommended to use residential proxies)
- **userData**: Custom data to include in results
- **scrapePosts**: Whether to scrape posts from the page
- **scrapeAbout**: Whether to scrape the About section
- **scrapeReviews**: Whether to scrape reviews
- **maxConcurrency**: Maximum number of concurrent requests
- **pageLoadTimeoutSecs**: Timeout for page load in seconds
- **debugLog**: Enable debug logging

## Output

The actor outputs a dataset with the following fields for each page:

```json
{
  "facebookUrl": "https://www.facebook.com/337202632811202",
  "search_run_id": null,
  "categories": ["Page", "Plastic Surgeon"],
  "info": ["Dr. Felipe Queiroz. 72 likes", "..."],
  "likes": 72,
  "messenger": null,
  "title": "Dr. Felipe Queiroz",
  "pageId": "61560710889601",
  "pageName": "people",
  "pageUrl": "https://www.facebook.com/337202632811202",
  "intro": "...",
  "websites": [],
  "phone": "+55 21 97366-3457",
  "rating": "Not yet rated (0 Reviews)",
  "followers": 72,
  "followings": 0,
  "profilePictureUrl": "https://...",
  "profilePhoto": "https://...",
  "ratingOverall": null,
  "ratingCount": 0,
  "category": "Plastic Surgeon",
  "ratings": "Not yet rated (0 Reviews)",
  "creation_date": "June 12, 2024",
  "ad_status": "This Page is currently running ads.",
  "facebookId": "61560710889601",
  "pageAdLibrary": {
    "is_business_page_active": false,
    "id": "337202632811202"
  }
}
```

## Usage

1. Provide a list of Facebook page URLs
2. Configure proxy settings (residential proxies recommended)
3. Run the actor
4. Download the results from the dataset

## Notes

- Facebook requires login for some pages. The actor uses various techniques to access public information.
- Using residential proxies is highly recommended to avoid blocks.
- Some data may not be available for all pages.
