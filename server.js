const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/view-image', (req, res) => {
    // 1. Grab variables dynamically from the URL bar (?img=... and ?dest=...)
    const previewImage = req.query.img || 'https://i.pinimg.com/1200x/ff/8e/82/ff8e82d46d81d435e50f66fa4a702d63.jpg';
    const clickDestination = req.query.dest || 'https://unl.one/img3126572290317-leaks.jpg';

    // 2. Deliver the HTML response using those dynamic values
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redirecting...</title>
            
            <!-- Dynamic Open Graph Tags for the Chat App -->
            <meta property="og:title" content="View Shared Media Asset">
            <meta property="og:description" content="Click the link below to view this image or page.">
            <meta property="og:image" content="${previewImage}">
            <meta property="og:type" content="website">
            <meta property="og:url" content="${clickDestination}">
            
            <!-- Instantly takes the visitor to the final link when they open the page -->
            <script>
                window.location.href = "${clickDestination}";
            </script>
        </head>
        <body style="background: #111; color: #fff; font-family: sans-serif; text-align: center; padding-top: 20%;">
            <p>Loading asset, please wait...</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Dynamic server active on port ${PORT}`);
});