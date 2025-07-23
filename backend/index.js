import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { Log } from './logger.js';

const app = express();
const PORT = 8000;


const urlDatabase = {};

app.use(cors());
app.use(express.json());

app.post('/shorturls', (req, res) => {
  Log("backend", "info", "handler", "Received request to create short URL");
  const { url, validity, shortcode: customShortcode } = req.body;

  if (!url) {
    Log("backend", "error", "handler", "URL is required but was not provided.");
    return res.status(400).json({ error: 'URL is required.' });
  }

  let shortcode;
  if (customShortcode) {
    shortcode = customShortcode;
    Log("backend", "info", "service", `Using provided custom shortcode: ${shortcode}`);
  } else {
    shortcode = nanoid(7);
    Log("backend", "info", "service", `No custom shortcode provided. Generated new shortcode: ${shortcode}`);
  }

  const validityMinutes = validity ? parseInt(validity, 10) : 30;
  const expiryDate = new Date(Date.now() + validityMinutes * 60000);

  urlDatabase[shortcode] = {
    originalUrl: url,
    creationDate: new Date(),
    expiryDate: expiryDate,
    clicks: [],
  };

  Log("backend", "info", "service", `Successfully created shortcode '${shortcode}' for URL: ${url}`);
  res.status(201).json({
    shortlink: `http://localhost:${PORT}/${shortcode}`,
    expiry: expiryDate.toISOString(),
  });
});

app.get('/shorturls/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  Log("backend", "info", "handler", `Statistics requested for shortcode: ${shortcode}`);
  const data = urlDatabase[shortcode];

  if (data) {
    res.status(200).json({
      creationDate: data.creationDate,
      expiryDate: data.expiryDate,
      originalUrl: data.originalUrl,
      totalClicks: data.clicks.length,
      clickData: data.clicks,
    });
  } else {
    Log("backend", "error", "handler", `Statistics requested for non-existent shortcode: ${shortcode}`);
    res.status(404).json({ error: 'Shortcode not found.' });
  }
});


app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  Log("backend", "info", "handler", `Redirect requested for shortcode: ${shortcode}`);
  const data = urlDatabase[shortcode];

  if (data && new Date() < data.expiryDate) {
    data.clicks.push({
      timestamp: new Date(),
      referrer: req.headers.referer || 'Direct',
      geo: { location: "Mysuru, Karnataka, India" } 
    });
    
    Log("backend", "info", "service", `Redirecting ${shortcode} to ${data.originalUrl}`);
    res.redirect(302, data.originalUrl);
  } else {
    Log("backend", "error", "handler", `Redirect failed for non-existent or expired shortcode: ${shortcode}`);
    res.status(404).send('URL not found or has expired.');
  }
});


app.listen(PORT, () => {
  console.log(`Backend microservice running on http://localhost:${PORT}`);
  Log("backend", "info", "service", `Server started successfully on port ${PORT}`);
});