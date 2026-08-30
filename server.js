const express = require('express');
const config = require('./config'); // Import your configuration settings
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/view-image', (req, res) => {
    // Select the desired path from the configuration file
    const chosenPath = config.PATHS.abstract;
    
    // Safely combine the domain and path using the built-in URL utility
    const fullAssetUrl = new URL(chosenPath, config.BASE_DOMAIN).toString();

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Media Viewer</title>
            <meta property="og:title" content="Shared Image View">
            <meta property="og:image" content="${fullAssetUrl}">
            <meta property="og:type" content="website">
        </head>
        <body style="background: #111; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <img src="${fullAssetUrl}" style="max-width: 100%; max-height: 100vh;" alt="Shared Asset">
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server organized and active on port ${PORT}`);
});