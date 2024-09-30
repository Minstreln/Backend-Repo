const express = require('express');
const multer = require('multer');
const applicationController = require('../../controllers/jobSeeker/applicationController');
const authController = require('../../controllers/jobSeeker/jobSeekerAuthController');
const AppError = require('../../utils/appError');

const Router = express.Router();

// Protect all routes using auth middleware
Router.use(authController.protect);

// Route to create a new application
Router.post('/create', 
    applicationController.uploadResume,
    applicationController.createApplication);

// Route to get all applications for a job listing
Router.get('/', applicationController.getAllApplications);

// Route to get a single application by id
Router.get('/:id', applicationController.getApplicationById);

// Route to update an application by id
Router.patch('/:id', applicationController.updateApplication);

// Route to delete an application by id
Router.delete('/:id', applicationController.deleteApplication);

module.exports = Router;
