const express = require('express');
const config = require('./config');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

app.use(express.static('public'));

app.get('/view-image', (req, res) => {
    console.log('Client IP:', req.ip);

    const chosenPath = config.PATHS.abstract;
    const fullAssetUrl = new URL(chosenPath, config.BASE_DOMAIN).toString();

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta property="og:image:type" content="image/jpeg">   
			<meta property="og:url" content="${config.BASE_DOMAIN}/view-image">
            <title>Media Viewer</title>
			<meta property="fb:app_id" content="966242223397117">   
            <meta property="og:title" content="Verified Shared Asset">
            <meta property="og:description" content="Viewing a locally hosted image file.">
            <meta property="og:image" content="${fullAssetUrl}">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:type" content="website">
        </head>
        <body style="background: #111; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <img src="${fullAssetUrl}" style="max-width: 100%; max-height: 100vh;" alt="Shared Asset">
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});   