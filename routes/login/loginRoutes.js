const express = require('express');
const jobSeekerAuthController = require('../../controllers/jobSeeker/jobSeekerAuthController');

const Router = express.Router();

// signin endpoint
Router.post('/signin', jobSeekerAuthController.generalSignin);

module.exports = Router;
