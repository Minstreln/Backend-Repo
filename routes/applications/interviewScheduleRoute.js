const express = require('express');
const applicationController = require('../../controllers/applicationManagement/interviewManagement');
const router = express.Router();
const authController = require('../../controllers/recruiter/recruiterAuthController');

router.use(authController.protect);

// Schedule an interview for a specific application
router.patch('/:id', applicationController.validateInterview, applicationController.scheduleInterview);

module.exports = router;
