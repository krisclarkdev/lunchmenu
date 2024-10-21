iconst express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

const screen = 'scr_709367acf3d4'
const widget = 'blk_6716a202ecf35838fa7b56e7'

// Dakboard API configuration
const apiUrl = `https://dakboard.com/api/2/screens/${screen}/blocks/${widget}`;

// Path to the API key and lunches file
const apiKeyFilePath = path.join(__dirname, 'apikey.txt');
const lunchesFilePath = path.join(__dirname, 'lunches.json');

// Read API key from file
let apiKey = '';
try {
  apiKey = fs.readFileSync(apiKeyFilePath, 'utf8').trim();
} catch (err) {
  console.error('Error reading API key file:', err.message);
  process.exit(1); // Exit if API key file is missing or unreadable
}

// In-memory cache of lunches
let lunches = [];

// Middleware to parse JSON and serve static frontend files
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function to get today's date in MM-DD-YYYY format
function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${month}-${day}-${year}`;
}

// Function to read lunches from the JSON file at startup
function loadLunches() {
  if (fs.existsSync(lunchesFilePath)) {
    const data = fs.readFileSync(lunchesFilePath, 'utf8');
    lunches = JSON.parse(data || '[]');
  } else {
    lunches = [];
  }
}

// Function to write lunches to the JSON file
function saveLunches() {
  fs.writeFileSync(lunchesFilePath, JSON.stringify(lunches, null, 2), 'utf8');
}

// Function to get today's menu from the in-memory lunches array
function getTodaysMenu() {
  const today = getCurrentDate();
  const todaysLunch = lunches.find(lunch => lunch.date === today);
  return todaysLunch ? todaysLunch.menu : ' '; // Return ' ' if no menu is found for today
}

// Function to send PUT request to Dakboard
async function updateDakboardText() {
  const menuText = getTodaysMenu();
  try {
    const response = await axios({
      method: 'PUT',
      url: `${apiUrl}?api_key=${apiKey}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `text=${encodeURIComponent(menuText)}`
    });
    console.log('Dakboard updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating Dakboard:', error.response ? error.response.data : error.message);
  }
}

// Get all lunches (for populating the UI)
app.get('/api/lunches', (req, res) => {
  res.json(lunches); // Serve the in-memory lunches array
});

// Add or update a lunch item
app.post('/api/lunches', (req, res) => {
  const { date, menu } = req.body;

  if (!date || !menu) {
    return res.status(400).json({ error: 'Date and menu are required' });
  }

  // Check if the date already exists, if so, update the item
  const existingLunch = lunches.find(lunch => lunch.date === date);
  if (existingLunch) {
    existingLunch.menu = menu;
  } else {
    // If it doesn't exist, add a new lunch item
    lunches.push({ date, menu });
  }

  // Write updated lunches back to the JSON file
  saveLunches();

  res.json({ message: 'Lunch item saved successfully' });
});

// Schedule the task to run at midnight (00:00) every day to send the PUT request to Dakboard
cron.schedule('0 0 * * *', () => {
  console.log('Running the scheduled task at midnight');
  updateDakboardText();
});

// Immediately update Dakboard on script startup
console.log('Running the task immediately at startup');
updateDakboardText();

// Load lunches from file at startup
loadLunches();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
