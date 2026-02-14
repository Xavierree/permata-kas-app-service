const { google } = require('googleapis');
const config = require('../config/env');
const { parseCurrency, formatPhoneNumber } = require('../utils/formatter');

// Column Indices (0-based) based on description:
// Nama, Tunggakan 2024, Tunggakan 2025, Jan 2026, Feb 2026, TOTAL, No HP
// 0: Name
// 1: 2024
// 2: 2025
// 3: Jan 26
// 4: Feb 26
// 5: TOTAL (String or Number)
// 6: Phone

const getAuth = () => {
    return new google.auth.GoogleAuth({
        keyFile: config.googleAppCredentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
};

const getSheets = async () => {
    // Mock Data Mode
    if (process.env.USE_MOCK_DATA === 'true' || !config.googleSheetsId) {
        return ["Mock Sheet 1", "Mock Sheet 2"];
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const meta = await sheets.spreadsheets.get({
            spreadsheetId: config.googleSheetsId
        });
        return meta.data.sheets.map(s => s.properties.title);
    } catch (error) {
        console.error("Get Sheets Error:", error);
        throw new Error("Failed to fetch sheet list.");
    }
};

// Simple In-Memory Cache
let cache = {
    data: null,
    lastFetch: 0,
    sheetName: null
};
const CACHE_TTL = 300 * 1000; // 5 Minutes

const getMembers = async (sheetName) => {
    // MOCK DATA MODE
    if (process.env.USE_MOCK_DATA === 'true' || !config.googleSheetsId) {
        console.log("Using Mock Data...");
        return [
            { name: "Andi Siregar", arrears2024: 0, arrears2025: 0, dues2026Detail: { "Jan 2026": 50000, "Feb 2026": 50000 }, totalDues2026: 100000, total: "100000", totalPayment: 100000, phone: "6281234567890", status: "UNPAID" },
        ];
    }

    // Check Cache
    const now = Date.now();
    // If we have data, it's fresh enough (< 5 min), and it's for the same sheet logic
    // (Note: sheetName might change, so we sort of need to cacheByKey if we support switching frequently)
    // Actually, 'sheetName' usually comes from the dropdown. 
    // Let's key the cache by sheetName.

    // For simplicity, if sheetName matches cached sheetName and is valid:
    if (cache.data && cache.sheetName === sheetName && (now - cache.lastFetch < CACHE_TTL)) {
        console.log("✅ Serving from cache");
        return cache.data;
    }

    console.time("GoogleAuth");
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    console.timeEnd("GoogleAuth");

    try {
        console.time("FetchMeta");
        // Step 1: Determine Sheet Name
        let targetRange;
        let actualSheetName = sheetName;

        if (actualSheetName) {
            targetRange = `${actualSheetName}!A1:AZ`; // Reduced from ZZ to AZ (52 cols is plenty)
        } else {
            const meta = await sheets.spreadsheets.get({ spreadsheetId: config.googleSheetsId });
            const sheetTitle = meta.data.sheets[0].properties.title;
            targetRange = `${sheetTitle}!A1:AZ`;
            actualSheetName = sheetTitle;
        }
        console.timeEnd("FetchMeta");

        console.log(`📡 Fetching from Google Sheets: ${targetRange}...`);

        console.time("FetchValues");
        // Step 2: Get Values
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.googleSheetsId,
            range: targetRange,
        });
        console.timeEnd("FetchValues");

        const rows = response.data.values;
        console.log(`📊 Rows fetched: ${rows ? rows.length : 0}`);

        if (!rows || rows.length === 0) return [];

        console.time("ParseData");
        // Step 3: Parse Headers (Row 0)
        const headers = rows[0].map(h => h.toString().trim().toUpperCase());

        // Find Indices
        const nameIndex = headers.findIndex(h => h === 'NAMA');
        const phoneIndex = headers.findIndex(h => h === 'NO HP' || h === 'NO. HP' || h === 'PHONE');
        const totalIndex = headers.findIndex(h => h === 'TOTAL');

        // Dynamic Year Parsing
        // We want to capture anything that looks like "20XX" or "20XX-20YY" 
        // BUT exclude "Jan 2026", "Feb 2026" etc which are handled by cols2026
        // AND exclude TOTAL, NO HP, NAMA

        const yearColumns = [];
        const cols2026 = [];

        headers.forEach((h, index) => {
            if (index === nameIndex || index === phoneIndex || index === totalIndex) return;

            // Check for 2026 monthly columns
            if (h.includes('2026')) {
                cols2026.push({ name: rows[0][index], index });
                return;
            }

            // Check for year columns (2019-2020, 2021, 2022, 2023, 2024, 2025)
            // Loose regex: contains 2019, 2020, 2021, 2022, 2023, 2024, 2025
            // Or just generally contains 20\d\d
            if (/\d{4}/.test(h)) {
                yearColumns.push({ name: rows[0][index], index });
            }
        });

        if (nameIndex === -1) {
            console.error("Could not find 'NAMA' column");
            return [];
        }

        // Step 4: Map Data
        const parsedData = rows.slice(1).map(row => {
            const name = row[nameIndex];
            if (!name) return null;

            // Map Year Columns (Dynamic)
            const arrearsMap = {};
            let totalArrears = 0;

            yearColumns.forEach(col => {
                const val = parseCurrency(row[col.index]);
                if (val > 0) {
                    arrearsMap[col.name] = val;
                    totalArrears += val;
                }
            });

            // Calculate 2026 Dues
            let totalDues2026 = 0;
            const dues2026Detail = {};

            cols2026.forEach(col => {
                const val = parseCurrency(row[col.index]);
                if (val > 0) {
                    dues2026Detail[col.name] = val;
                    totalDues2026 += val;
                }
            });

            const totalRaw = totalIndex !== -1 ? row[totalIndex] : '0';
            const phone = phoneIndex !== -1 ? formatPhoneNumber(row[phoneIndex]) : '';

            let status = 'UNPAID';
            let totalPayment = 0;

            if (totalRaw && String(totalRaw).toUpperCase().includes('LUNAS')) {
                status = 'PAID';
            } else {
                totalPayment = totalArrears + totalDues2026;
            }

            return {
                name,
                arrearsMap, // New dynamic object replacing arrears2024/2025 fixed fields
                totalDues2026,
                dues2026Detail,
                total: totalRaw,
                totalPayment,
                phone,
                status
            };
        }).filter(m => m !== null); // Filter out empty rows

        // Update Cache
        cache.data = parsedData;
        cache.sheetName = actualSheetName;
        cache.lastFetch = now;

        return parsedData;

    } catch (error) {
        console.error("Google Sheets API Error:", error);
        throw new Error("Failed to fetch data from Google Sheets: " + error.message);
    }
};

module.exports = { getMembers, getSheets };
