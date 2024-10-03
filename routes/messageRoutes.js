const express = require('express');
const router = express.Router();
const messageController = require('../controllers/customerSuport/messageConroller');

// Create a new message
router.post('/', messageController.createMessage);

// Get all messages for a specific ticket
router.get('/:ticketId', messageController.getMessages);

module.exports = router;
