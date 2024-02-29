const express = require('express');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: 'https://www.hotspot.games' })); // Enable CORS for all routes

// Load the credentials for the service account
const credentials = require('./service-account-credentials.json');

// Initialize the Sheets API
const sheets = google.sheets({
  version: 'v4',
  auth: new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  }),
});

// Serve all static files using express.static
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), { "Content-Type": "text/html" });
});

app.get('/data', async (req, res) => {
  try {
    // Specify your spreadsheet ID and range
    const spreadsheetId = '1tTv0pmEy9DzLEE4rmTgeq34XPdzlCI_gWctUwlfcpmU';
    const range = 'Sheet1';

    // Retrieve data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;

    // Process the data as needed
    const processedData = values.map(row => ({
      column1: row[0],
      column2: row[1],
      column3: row[2],
      column4: row[3],
      column5: row[4],
      // Add more columns as needed
    }));

    // Send the processed data to the frontend
    res.json({ success: true, data: processedData });
  } catch (error) {
    console.error('Error retrieving data from Google Sheets:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
