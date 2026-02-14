const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheets');
const templateUtils = require('../utils/templates');

// GET /api/sheets
router.get('/sheets', async (req, res) => {
    try {
        const sheets = await sheetsService.getSheets();
        res.json(sheets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/members
router.get('/members', async (req, res) => {
    try {
        const sheetName = req.query.sheet; // Optional query param
        const members = await sheetsService.getMembers(sheetName);
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/generate
router.post('/generate', (req, res) => {
    const { member, senderName, greeting } = req.body;

    if (!member || !senderName || !greeting) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Validating member object structure briefly (optional but good)
    if (!member.name) {
        return res.status(400).json({ error: "Invalid member data" });
    }

    try {
        const message = templateUtils.generateTemplate(member, senderName, greeting);

        let responseData = {
            message: message,
            phone: member.phone,
            status: member.status
        };

        if (member.status === 'PAID') {
            responseData.message = null; // Explicitly null
            responseData.info = "Anggota sudah LUNAS. Tidak ada tagihan.";
        } else if (!message) {
            // Fallback if message is null but status isn't PAID? Should not happen with current logic but handle it.
            responseData.message = null;
            responseData.info = "Tidak ada tagihan yang perlu dibayar.";
        }

        res.json(responseData);

    } catch (error) {
        console.error("Template Gen Error:", error);
        res.status(500).json({ error: "Failed to generate template" });
    }
});

module.exports = router;
