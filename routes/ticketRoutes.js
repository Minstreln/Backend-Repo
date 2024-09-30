const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/customerSuport/ticketsControllers');

// Create a new ticket
router.post('/tickets', ticketController.createTicket);

// Get all tickets for a user
router.get('/tickets', ticketController.getUserTickets);

// Get a specific ticket by ID
router.get('/tickets/:id', ticketController.getTicket);

// Update ticket status
router.put('/tickets/:id', ticketController.updateTicketStatus);

module.exports = router;
