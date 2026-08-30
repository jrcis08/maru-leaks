const express = require('express'); 
const axios = require('axios'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 

// Fixed the arrow function syntax here: '=> {'
app.get('/view-image', async (req, res) => { 
    // Replace 'link' with a valid public image URL (e.g., from Unsplash or Imgur)
    const originalImageUrl = 'https://unl.one/img3126572290317-leaks.jpg'; 
    
    try { 
        const response = await axios({ 
            url: originalImageUrl, 
            method: 'GET', 
            responseType: 'stream' 
        }); 
        res.setHeader('Content-Type', response.headers['content-type']); 
		res.setHeader('X-Proxy-Agent', 'NodeJS-Express');
		res.setHeader('Cache-Control', 'no-store');
        response.data.pipe(res); 
    } catch (error) { 
        res.status(500).send('Error loading the image'); 
    } 
}); 

// Fixed the arrow function syntax here: '=>'
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`); 
});