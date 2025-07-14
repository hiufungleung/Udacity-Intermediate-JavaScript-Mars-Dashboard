require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/rover/:name', async (req, res) => {
    const rover = req.params.name.toLowerCase();
    const date = new Date();
    let dateStr = date.toISOString().split('T')[0];

    let data;

    for (let i = 0; i < 5; i++) {
        try {
            console.log(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${dateStr}&api_key=${process.env.API_KEY}`);
            const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${dateStr}&api_key=${process.env.API_KEY}`);
            data = await response.json();

            if (data.photos && data.photos.length > 0) {
                const result = {
                    rover: {
                        name: data.photos[0].rover.name,
                        landing_date: data.photos[0].rover.landing_date,
                        launch_date: data.photos[0].rover.launch_date,
                        status: data.photos[0].rover.status
                    },
                    photos: data.photos.map(photo => ({
                        img_src: photo.img_src,
                        earth_date: photo.earth_date
                    }))
                };
                return res.send(result);
            }
        } catch (err) {
            console.error(`Error fetching data for ${rover} on ${dateStr}`, err);
        }

        date.setDate(date.getDate() - 1);
        dateStr = date.toISOString().split('T')[0];
    }

    res.status(404).send({ error: `No photos found for rover "${rover}" in the past 5 days.` });
});

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))