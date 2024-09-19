const express = require('express');
const applicationController = require('../../controllers/applicationManagement/applicationManagementController');
const router = express.Router();
const authController = require('../../controllers/recruiter/recruiterAuthController');

router.use(authController.protect)

router.route('/applications').get(applicationController.getApplications);

// Get a single application by ID
router.route('/:id').get(applicationController.getApplicationById);

// Get all applications for a specific job listing
router.route('/job/:jobListingId').get(applicationController.getApplicationsByJob);

// Update the status of an application
router.route('/update/:id').patch(applicationController.updateApplicationStatus);

module.exports = router;
