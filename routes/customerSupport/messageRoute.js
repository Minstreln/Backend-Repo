const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/customerSupport/messageController');
const authController = require('../../controllers/jobSeeker/jobSeekerAuthController');

router.use(authController.protect)

// Create a new message
router.post('/', messageController.createMessage);

// Get all messages for a specific ticket
router.get('/:ticketId', messageController.getMessages);

module.exports = router;
