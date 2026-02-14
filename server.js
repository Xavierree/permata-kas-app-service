const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const config = require('./src/config/env');
const apiRoutes = require('./src/routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', apiRoutes);

// Fallback for SPA (removed to fix path-to-regexp issue, generic static serve is enough)
// app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Start Server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
