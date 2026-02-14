const { google } = require('googleapis');
const config = require('./src/config/env');

async function debugSheet() {
    const auth = new google.auth.GoogleAuth({
        keyFile: config.googleAppCredentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. List all sheets to get exact names
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: config.googleSheetsId
    });

    console.log("Available Sheets:");
    meta.data.sheets.forEach(s => console.log(`- ${s.properties.title}`));

    // 2. Fetch header row of the 2025-2027 sheet
    const targetTitle = "data+no hp 2025-2027";
    const targetSheet = meta.data.sheets.find(s => s.properties.title === targetTitle);

    if (targetSheet) {
        console.log(`\nInspecting ${targetTitle}...`);
        const range = `${targetTitle}!A1:Q200`; // Header + 1 row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.googleSheetsId,
            range: range,
        });
        console.log("Headers:", response.data.values[0]);
        console.log("Row 1:", response.data.values[1]);
    } else {
        console.log("Could not find a 2025-2027 sheet.");
    }
}

debugSheet().catch(console.error);
