const express = require('express');
const jobSeekerAuthController = require('../../controllers/jobSeeker/jobSeekerAuthController');

const Router = express.Router();

// jobseeker signup endpoint
Router.post('/signup', jobSeekerAuthController.jobSeekerSignup);

// jobseeker signin endpoint
Router.post('/signin', jobSeekerAuthController.jobSeekerSignin);

// jobseeker logout endpoint
Router.get('/logout', jobSeekerAuthController.jobSeekerLogout);

// jobseeker forgot password endpoint
Router.post('/forgot-password', jobSeekerAuthController.jobSeekerForgotPassword);

// jobseeker update password endpoint
Router.patch('/update-password', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerAuthController.jobSeekerUpdatePassword
);
  
//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// jobseeker confirm mail token endpoint
Router.get('/confirm-mail/:token', jobSeekerAuthController.confirmMail);

// jobseeker reset password token endpoint
Router.patch('/reset-password/:token', jobSeekerAuthController.jobSeekerResetPassword);

module.exports = Router;
