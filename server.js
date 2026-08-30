const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Tell Express to serve files from the "public" folder automatically
app.use(express.static(path.join(__dirname, 'public')));

app.get('/view-image', (req, res) => {
    // 2. Determine your server's current host domain dynamically
    const host = req.get('host');
    const protocol = req.protocol;
    
    // 3. Create a clean link pointing directly to the file hosted on YOUR server
    const localAssetUrl = `${protocol}://${host}/photo.jpg`;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Media Viewer</title>
            
            <!-- Open Graph Tags pointing directly to your locally hosted file -->
            <meta property="og:title" content="Verified Shared Asset">
            <meta property="og:description" content="Viewing a locally hosted image file.">
            <meta property="og:image" content="${localAssetUrl}">
            <meta property="og:type" content="website">
        </head>
        <body style="background: #111; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <img src="${localAssetUrl}" style="max-width: 100%; max-height: 100vh;" alt="Shared Asset">
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server serving static assets on port ${PORT}`);
});