const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

const BROWSER_CONFIG = {
    headless: "new",
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1920,1080'
    ]
};

async function fetchZepto(query, browser) {
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 15000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        const firstItem = $('[data-testid="product-card"]').first();
        if (!firstItem.length) return null;
        const priceText = firstItem.find('[data-testid="product-price"]').text().replace(/[^0-9.]/g, '');
        const productId = firstItem.attr('href')?.split('/')[2] || 'unknown';
        return { platform: 'zepto', price: parseFloat(priceText) || 0, deliveryFee: 15, eta: '10 mins', productId };
    } catch (error) {
        return null;
    } finally {
        await page.close();
    }
}

async function fetchBlinkit(query, browser) {
    const page = await browser.newPage();
    try {
        await page.goto(`https://blinkit.com/s/?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 15000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        const firstItem = $('.Product__Container-sc-11dk8zl-0').first();
        if (!firstItem.length) return null;
        const priceText = firstItem.find('.ProductPrice__Price-sc-1j28bxs-0').text().replace(/[^0-9.]/g, '');
        const productId = firstItem.find('a').attr('href')?.split('/')[2] || 'unknown';
        return { platform: 'blinkit', price: parseFloat(priceText) || 0, deliveryFee: 16, eta: '12 mins', productId };
    } catch (error) {
        return null;
    } finally {
        await page.close();
    }
}

async function fetchInstamart(query, browser) {
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 15000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        const firstItem = $('[data-testid="item-container"]').first();
        if (!firstItem.length) return null;
        const priceText = firstItem.find('[data-testid="item-price"]').text().replace(/[^0-9.]/g, '');
        const productId = firstItem.attr('id') || 'unknown';
        return { platform: 'instamart', price: parseFloat(priceText) || 0, deliveryFee: 10, eta: '15 mins', productId };
    } catch (error) {
        return null;
    } finally {
        await page.close();
    }
}

async function searchAllPlatforms(query, lat, lng) {
    const browser = await puppeteer.launch(BROWSER_CONFIG);
    try {
        const [zepto, blinkit, instamart] = await Promise.all([
            fetchZepto(query, browser),
            fetchBlinkit(query, browser),
            fetchInstamart(query, browser)
        ]);
        return [zepto, blinkit, instamart].filter(Boolean).sort((a, b) => (a.price + a.deliveryFee) - (b.price + b.deliveryFee));
    } finally {
        await browser.close();
    }
}

module.exports = { searchAllPlatforms };
