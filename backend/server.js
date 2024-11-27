import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

app.get('/api/sounds', async (req, res) => {
    const ids = req.query.ids.split(',');
    const url = `https://freesound.org/apiv2/sounds/${ids[0]}/?token=${process.env.FREE_SOUND_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
   } catch (error) {
       res.status(500).json({ error: 'failed to fetch sound' });
   }
});

app.listen(port, () => {
   console.log(`Server running on port: ${port}`)
});
