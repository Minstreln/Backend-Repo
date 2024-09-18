const express = require('express');
const applicationController = require('../../controllers/jobSeeker/applicationController');
const authController = require('../../controllers/jobSeeker/jobSeekerAuthController');

const Router = express.Router();

Router.use(authController.protect);

// create a new application
Router.post('/create', applicationController.createApplication);

// get all applications for a job listing
Router.get('/', applicationController.getAllApplications);


// get a single application by id
Router.get('/:id', applicationController.getApplicationById);

// update an application by id
Router.patch('/:id', applicationController.updateApplication);

// delete an application by id
Router.delete('/:id', applicationController.deleteApplication);

module.exports = app;
