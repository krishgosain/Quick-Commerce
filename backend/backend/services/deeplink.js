function generateDeepLink(platform, productId) {
    switch (platform.toLowerCase()) {
        case 'zepto':
            return `zepto://product/${productId}`;
        case 'blinkit':
            return `blinkit://product/${productId}`;
        case 'instamart':
            return `swiggy://instamart/item/${productId}`;
        default:
            throw new Error('Unsupported platform');
    }
}

module.exports = { generateDeepLink };
