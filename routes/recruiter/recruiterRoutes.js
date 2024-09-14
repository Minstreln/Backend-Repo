const express = require('express');
const recruiterAuthController = require('../../controllers/recruiter/recruiterAuthController');
const recruiterController = require('../../controllers/recruiter/recruiterController');

const Router = express.Router();

// recruiter signup endpoint
Router.post('/signup', recruiterAuthController.recruiterSignup);

// recruiter signin endpoint
Router.post('/signin', recruiterAuthController.recruiterSignin);

// recruiter logout endpoint
Router.get('/logout', recruiterAuthController.recruiterLogout);

// recruiter forgot password endpoint
Router.post('/forgot-password', recruiterAuthController.recruiterForgotPassword);

// recruiter update password endpoint
Router.patch('/update-password', 
    recruiterAuthController.protect,
    recruiterAuthController.restrictTo('recruiter'),
    recruiterAuthController.recruiterUpdatePassword
);

// recruiter update personal detail endpoint
Router.post('/personal-detail',
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'), 
    recruiterController.uploadRecruiterPhoto,
    recruiterController.resizeRecruiterPhoto,
    recruiterController.recruiterPersonalDetail
);

// recruiter update company detail endpoint
Router.post('/company-detail',
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'), 
    recruiterController.uploadRecruiterPhoto,
    recruiterController.resizeRecruiterPhoto,
    recruiterController.recruiterCompanyDetail
);

// jobseeker update experience detail endpoint
Router.post('/experience',
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.recruiterExperience
);

//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// recruiter confirm mail token endpoint
Router.get('/confirm-mail/:token', recruiterAuthController.confirmMail);

// recruiter reset password token endpoint
Router.patch('/reset-password/:token', recruiterAuthController.recruiterResetPassword);

module.exports = Router;
