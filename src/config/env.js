require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  googleSheetsId: process.env.GOOGLE_SHEETS_ID,
  googleAppCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};
