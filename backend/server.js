const express = require('express');
const cors = require('cors');
const { searchAllPlatforms } = require('./services/scraper');
const { generateDeepLink } = require('./services/deeplink');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/search', async (req, res) => {
    const { query, lat, lng } = req.query;
    if (!query || !lat || !lng) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        const results = await searchAllPlatforms(query, lat, lng);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/checkout', (req, res) => {
    const { platform, productId } = req.body;
    if (!platform || !productId) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const deepLink = generateDeepLink(platform, productId);
    res.json({ url: deepLink });
});

app.listen(8080, () => console.log('Aggregator API running on port 8080'));
