const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/customerSupport/ticketController');
const authController = require('../../controllers/jobSeeker/jobSeekerAuthController');

router.use(authController.protect)

// Create a new ticket
router.post('/', ticketController.createTicket);

// Get all tickets for a user
router.get('/', ticketController.getUserTickets);

// Get a specific ticket by ID
router.get('/:id', ticketController.getTicket);

// Update ticket status
router.put('/:id', ticketController.updateTicketStatus);

module.exports = router;
