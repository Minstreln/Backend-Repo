const express = require('express');
const applicationController = require('../controllers/applicationManagements/applicationController');
const router = express.Router();

// Get all applications for a specific job
router.route('/jobs/:jobId').get(applicationController.getApplications);

// Get a single application by ID
router.route('/:id').get(applicationController.getApplication);

// Update the status of an application
router.route('/update/:id').patch(applicationController.updateApplicationStatus);

module.exports = router;
