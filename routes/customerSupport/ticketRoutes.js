const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/customerSupport/ticketController');
const authController = require('../../controllers/jobSeeker/jobSeekerAuthController');
const recruiterAuthControler= require('../../controllers/recruiter/recruiterAuthController')

// Protect all routes to ensure user is authenticated
router.use(authController.protect);

// Routes for job seekers (authenticated users)
router.post('/', ticketController.createTicket);
router.get('/', ticketController.getUserTickets);
router.get('/:id', ticketController.getTicket);
router.patch('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Restrict `updateTicketStatus` to recruiters and admins only
router.patch(
  '/updateTicketStatus/:id',
  recruiterAuthControler.restrictTo('recruiter', 'admin'), 
  ticketController.updateTicketStatus
);

module.exports = router;
