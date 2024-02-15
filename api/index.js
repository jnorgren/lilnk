const express = require('express');
const app = express();
const port = 8080;

// Body parser middleware to parse request bodies
app.use(express.json());

// In-memory storage for the short-long URL mappings
const urlDatabase = {};

// Function to generate a short URL identifier
function generateShortURL() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Improved function to ensure uniqueness
function getUniqueShortURL() {
  let shortUrl = generateShortURL();
  // Check if the short URL already exists and generate a new one until it's unique
  while (urlDatabase.hasOwnProperty(shortUrl)) {
    shortUrl = generateShortURL();
  }
  return shortUrl;
}

// Route to create a short URL
app.post('/api/shorten', (req, res) => {
  let { longUrl } = req.body;
  if (!longUrl) {
    return res.status(400).send('A URL is required.');
  }

  // Check if longUrl starts with http:// or https://, if not prepend http://
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = 'http://' + longUrl;
  }

  // Parse the longUrl to get its domain
  const longUrlDomain = new URL(longUrl).hostname;

  // Get the domain of the host from the request headers
  const requestHost = req.headers.host;

  // Check if the domain of longUrl matches the host header
  if (longUrlDomain === requestHost) {
    return res.status(400).send('The URL domain must not match the host domain.');
  }

  const shortUrl = getUniqueShortURL();
  urlDatabase[shortUrl] = longUrl;
  res.send(`https://lilnk.io/${shortUrl}`);
});

// Route to list urlDatabase
app.get('/api/list', (req, res) => {
  res.send(Object(urlDatabase));
});

// Route to redirect from a short URL
app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const longUrl = urlDatabase[shortUrl];
  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(port, () => {
  console.log(`URL Shortener app listening at http://localhost:${port}`);
});
