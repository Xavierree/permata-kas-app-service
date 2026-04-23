require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  googleSheetsId: process.env.GOOGLE_SHEETS_ID,
  googleSheetsIdInviting: process.env.GOOGLE_SHEETS_ID_INVITING || '16dXaf9T2D7WP_q-nu6xzvsZYthibXOY_x3Iq2CkpHSY',
  googleAppCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};
