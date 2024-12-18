const express = require('express');
const applicationController = require('../../controllers/jobSeeker/applicationController');
const authController = require('../../controllers/jobSeeker/jobSeekerAuthController');
const jobSeekerAuthController = require('../../controllers/jobSeeker/jobSeekerAuthController');

const Router = express.Router();

Router.use(authController.protect);

// Route to create a new application
Router.post('/create', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    applicationController.uploadResume,
    applicationController.createApplication
);

// Route to get all applications for a job listing
Router.get('/', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    applicationController.getAllApplications
);

// Route to get a single application by id
Router.get('/:id', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    applicationController.getApplicationById
);

// Route to update an application by id
Router.patch('/:id', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    applicationController.updateApplication
);

// Route to delete an application by id
Router.delete('/:id', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    applicationController.deleteApplication
);

module.exports = Router; 
