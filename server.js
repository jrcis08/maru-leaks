const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

app.use(express.static('public'));

app.get('/image-proxy', (req, res) => {
    console.log('Client IP:', req.ip);

    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Missing URL' });
    }

    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
    res.redirect(proxyUrl);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});   