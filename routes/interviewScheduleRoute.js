const express = require('express');
const applicationController = require('../../controllers/applicationController');
const router = express.Router();

// Schedule an interview for a specific application
router.patch('/:id/scheduleInterview', applicationController.scheduleInterview);

module.exports = router;
