const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/sounds', async (req, res) => {
   const query = req.query.q || 'nature';
   const url = `https://freesound.org/apiv2/sounds/search?q=${query}&token=${process.env.FREESOUND_API_KEY}`;

   try {
       const response = await fetch(url);
       const data = response.json();
       res.json(data);
   } catch (error) {
       res.status(500).json({ error: 'failed to fetch sound' });
   }
});

app.listen(port, () => {
   console.log(`Server running on port: ${port}`)
});
