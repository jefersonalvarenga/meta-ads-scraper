/**
 * Extract page data from Facebook page
 */
export async function extractPageData(page, options = {}) {
    const { url, scrapeAbout, userData } = options;

    const data = await page.evaluate(({ scrapeAbout }) => {
        const result = {
            facebookUrl: window.location.href,
            search_run_id: null,
            categories: [],
            info: [],
            likes: null,
            messenger: null,
            title: null,
            pageId: null,
            pageName: 'people',
            pageUrl: window.location.href,
            intro: null,
            websites: [],
            phone: null,
            rating: null,
            followers: null,
            followings: 0,
            profilePictureUrl: null,
            profilePhoto: null,
            ratingOverall: null,
            ratingCount: 0,
            category: null,
            ratings: null,
            creation_date: null,
            ad_status: null,
            facebookId: null,
            pageAdLibrary: {
                is_business_page_active: false,
                id: null,
            },
        };

        // Extract page title
        const titleSelectors = [
            'h1',
            '[role="main"] h1',
            'span[dir="auto"]',
        ];

        for (const selector of titleSelectors) {
            const titleEl = document.querySelector(selector);
            if (titleEl && titleEl.textContent.trim()) {
                result.title = titleEl.textContent.trim();
                break;
            }
        }

        // Extract page ID from URL or meta tags
        const urlMatch = window.location.href.match(/\/(\d+)/);
        if (urlMatch) {
            result.pageId = urlMatch[1];
            result.facebookId = urlMatch[1];
            result.pageAdLibrary.id = urlMatch[1];
        }

        // Try to extract from meta tags
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(tag => {
            const property = tag.getAttribute('property') || tag.getAttribute('name');
            const content = tag.getAttribute('content');

            if (property === 'al:android:url' && content) {
                const idMatch = content.match(/\/(\d+)/);
                if (idMatch) {
                    result.pageId = idMatch[1];
                    result.facebookId = idMatch[1];
                    result.pageAdLibrary.id = idMatch[1];
                }
            }
        });

        // Extract category
        const categorySelectors = [
            '[class*="category"]',
            'a[href*="category"]',
            'span:contains("·")',
        ];

        const allText = document.body.innerText;

        // Common categories to look for
        const categories = [
            'Plastic Surgeon', 'Doctor', 'Medical Center', 'Hospital',
            'Dentist', 'Clinic', 'Restaurant', 'Shop', 'Store',
            'Company', 'Business', 'Brand', 'Product', 'Service',
            'Artist', 'Musician', 'Public Figure', 'Entrepreneur',
        ];

        for (const cat of categories) {
            if (allText.includes(cat)) {
                result.category = cat;
                result.categories.push('Page', cat);
                break;
            }
        }

        // Extract likes and followers
        const numberRegex = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:K|M|B)?\s*(?:likes|followers|seguidores|curtidas)/gi;
        const matches = allText.matchAll(numberRegex);

        for (const match of matches) {
            let num = match[1].replace(/,/g, '');
            if (match[0].toLowerCase().includes('k')) num = parseFloat(num) * 1000;
            if (match[0].toLowerCase().includes('m')) num = parseFloat(num) * 1000000;
            if (match[0].toLowerCase().includes('b')) num = parseFloat(num) * 1000000000;
            num = Math.floor(parseFloat(num));

            if (match[0].toLowerCase().includes('like') || match[0].toLowerCase().includes('curtida')) {
                result.likes = num;
            }
            if (match[0].toLowerCase().includes('follow') || match[0].toLowerCase().includes('seguidor')) {
                result.followers = num;
            }
        }

        // Extract phone number
        const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{0,5}/g;
        const phoneMatches = allText.match(phoneRegex);
        if (phoneMatches) {
            // Filter to likely phone numbers (longer than 8 digits)
            const validPhones = phoneMatches.filter(p => p.replace(/\D/g, '').length >= 8);
            if (validPhones.length > 0) {
                result.phone = validPhones[0].trim();
            }
        }

        // Extract intro/bio
        const bioSelectors = [
            '[data-ad-rendering-role="profile_bio"]',
            '[class*="bio"]',
            '[class*="intro"]',
        ];

        for (const selector of bioSelectors) {
            const bioEl = document.querySelector(selector);
            if (bioEl && bioEl.textContent.trim()) {
                result.intro = bioEl.textContent.trim();
                break;
            }
        }

        // If no intro found, try to extract from visible text
        if (!result.intro) {
            const paragraphs = document.querySelectorAll('p, div[dir="auto"]');
            for (const p of paragraphs) {
                const text = p.textContent.trim();
                if (text.length > 20 && text.length < 500 && !text.includes('Like') && !text.includes('Share')) {
                    result.intro = text;
                    break;
                }
            }
        }

        // Extract profile picture
        const images = document.querySelectorAll('img');
        for (const img of images) {
            const src = img.src;
            if (src && (src.includes('scontent') || src.includes('fbcdn'))) {
                result.profilePictureUrl = src;
                break;
            }
        }

        // Extract rating
        const ratingRegex = /(\d+\.?\d*)\s*(?:stars?|estrelas?)|Not yet rated|Ainda não avaliado/gi;
        const ratingMatches = allText.match(ratingRegex);
        if (ratingMatches) {
            if (ratingMatches[0].toLowerCase().includes('not yet') || ratingMatches[0].toLowerCase().includes('ainda não')) {
                result.rating = 'Not yet rated (0 Reviews)';
                result.ratings = 'Not yet rated (0 Reviews)';
                result.ratingCount = 0;
            } else {
                const ratingNum = parseFloat(ratingMatches[0].match(/\d+\.?\d*/)[0]);
                result.ratingOverall = ratingNum;
                result.rating = `${ratingNum} stars`;
                result.ratings = `${ratingNum} stars`;
            }
        }

        // Extract review count
        const reviewRegex = /(\d+(?:,\d+)*)\s*(?:reviews?|avaliações?)/gi;
        const reviewMatches = allText.match(reviewRegex);
        if (reviewMatches) {
            const reviewCount = parseInt(reviewMatches[0].match(/\d+(?:,\d+)*/)[0].replace(/,/g, ''));
            result.ratingCount = reviewCount;
        }

        // Extract creation date
        const dateRegex = /(?:Created|Criado|Joined|Ingressou).*?(\w+\s+\d+,\s+\d{4})/gi;
        const dateMatches = allText.match(dateRegex);
        if (dateMatches) {
            const dateMatch = dateMatches[0].match(/(\w+\s+\d+,\s+\d{4})/);
            if (dateMatch) {
                result.creation_date = dateMatch[1];
            }
        }

        // Check for ads
        if (allText.includes('currently running ads') || allText.includes('executando anúncios')) {
            result.ad_status = 'This Page is currently running ads.';
            result.pageAdLibrary.is_business_page_active = true;
        } else if (allText.includes('not running ads') || allText.includes('não está executando anúncios')) {
            result.ad_status = 'This Page is not running ads.';
        }

        // Extract websites
        const links = document.querySelectorAll('a[href]');
        const websiteRegex = /^https?:\/\/(?!.*facebook\.com|.*fb\.com|.*messenger\.com).+/;
        for (const link of links) {
            const href = link.href;
            if (websiteRegex.test(href)) {
                if (!result.websites.includes(href)) {
                    result.websites.push(href);
                }
            }
        }

        // Build info array
        if (result.title) {
            let infoText = result.title;
            if (result.likes) {
                infoText += `. ${result.likes} likes`;
            }
            result.info.push(infoText);
        }

        if (result.intro) {
            result.info.push(result.intro);
        }

        return result;
    }, { scrapeAbout });

    // Add profile photo URL based on page ID
    if (data.pageId) {
        data.profilePhoto = `https://www.facebook.com/photo/?fbid=${data.pageId}&set=a.${data.pageId}`;
    }

    return data;
}
