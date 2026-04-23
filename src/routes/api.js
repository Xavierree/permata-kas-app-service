const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheets');
const templateUtils = require('../utils/templates');
const template2Utils = require('../utils/template-2');
const templateInviteUtils = require('../utils/template-invite');
const templatePromotionUtils = require('../utils/template-promotion');

// GET /api/sheets
router.get('/sheets', async (req, res) => {
    try {
        const mode = req.query.mode || 'permata';
        const sheets = await sheetsService.getSheets(mode);
        res.json(sheets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/members
router.get('/members', async (req, res) => {
    try {
        const sheetName = req.query.sheet; // Optional query param
        const mode = req.query.mode || 'permata';
        const members = await sheetsService.getMembers(sheetName, mode);
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/generate
router.post('/generate', (req, res) => {
    const { member, senderName, greeting, groupLink, useIntroduction = true, mode = 'permata', noSenderName, noReceiverName } = req.body;

    if (!member || !senderName || !greeting) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Validating member object structure briefly (optional but good)
    if (!member.name) {
        return res.status(400).json({ error: "Invalid member data" });
    }

    try {
        let message;
        if (mode === 'inviting') {
            message = templateInviteUtils.generateTemplate(member, senderName, greeting, groupLink);
        } else if (mode === 'promotion') {
            message = templatePromotionUtils.generateTemplate(member, senderName, greeting, noSenderName, noReceiverName);
        } else if (useIntroduction === false || useIntroduction === 'false') {
            message = template2Utils.generateTemplate(member, senderName, greeting);
        } else {
            message = templateUtils.generateTemplate(member, senderName, greeting);
        }

        let responseData = {
            message: message,
            phone: member.phone,
            status: mode === 'promotion' ? 'PROMOTION' : member.status
        };

        if (mode === 'promotion') {
            if (!message) {
                 responseData.message = null;
                 responseData.info = "Gagal membuat template promosi.";
            }
        } else if (member.status === 'PAID') {
            responseData.message = null; // Explicitly null
            responseData.info = "Anggota sudah LUNAS. Tidak ada tagihan.";
        } else if (!message) {
            // Fallback if message is null
            responseData.message = null;
            if (mode === 'inviting') {
                responseData.info = "Gagal membuat template undangan.";
            } else {
                responseData.info = "Tidak ada tagihan yang perlu dibayar.";
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error("Template Gen Error:", error);
        res.status(500).json({ error: "Failed to generate template" });
    }
});

module.exports = router;
