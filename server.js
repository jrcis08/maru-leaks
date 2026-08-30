const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/view-image', (req, res) => {
    // A standard, public image URL used for the preview and the page display
    const publicImageUrl = 'https://unl.one/img3126572290317-leaks.jpg';

    // Send an HTML response containing standard Open Graph tags
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Image Viewer</title>
            
            <!-- Open Graph Tags for Chat Previews -->
            <meta property="og:title" content="Shared Image View">
            <meta property="og:description" content="Click to view the shared image asset.">
            <meta property="og:image" content="${publicImageUrl}">
            <meta property="og:type" content="website">
            
            <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #111; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
            </style>
        </head>
        <body>
            <img src="${publicImageUrl}" alt="Shared Asset">
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server active on port ${PORT}`);
});