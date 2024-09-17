const express = require('express');
const jobApplicationController = require('../../controllers/jobApplication/jobApplicationController');
const jobSeekerAuthController = require('../../controllers/jobSeeker/jobSeekerAuthController');

const Router = express.Router();

//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// endpoint to apply for jobs by jobseekers
Router.post('/:jobId', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    jobApplicationController.uploadJobseekerResume,
    jobApplicationController.applyToJob
);


module.exports = Router;
