const express = require('express');
const recruiterAuthController = require('../../controllers/recruiter/recruiterAuthController');
const recruiterFbAuthController = require('../../controllers/recruiter/oauth/recruiterFbAuthController');
const recruiterGoogleAuthCallback = require('../../controllers/recruiter/oauth/recruiterGoogleAuthController');
const recruiterController = require('../../controllers/recruiter/recruiterController');

const Router = express.Router();

// recruiter signup endpoint
Router.post('/signup', recruiterAuthController.recruiterSignup);

// recruiter signin endpoint
// Router.post('/signin', recruiterAuthController.recruiterSignin);

// recruiter logout endpoint
Router.get('/logout', recruiterAuthController.recruiterLogout);



/////////////////////////////// GOOGLE OAUTH ENDPOINTS /////////////////////////////////

// Google initialisation endpoint
Router.get('/auth/google', recruiterGoogleAuthCallback.recruiterGoogleAuthInit);

// Google callback endpoint
Router.get('/auth/google/callback', recruiterGoogleAuthCallback.recruiterGoogleAuthCallback);

/////////////////////////////// FACEBOOK OAUTH ENDPOINTS /////////////////////////////////

// Facebook initialisation endpoint
Router.get('/auth/facebook', recruiterFbAuthController.recruiterFbAuthInit);

// Facebook callback endpoint
Router.get('/auth/facebook/callback', recruiterFbAuthController.recruiterFbAuthCallback);




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

// get saved jobseeker
Router.get('/saved-jobseeker', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.getSavedCandidates,
);

// get my open job listings
Router.get('/open-jobs', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.getOpenJobs,
);

//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// save job seeker profile
Router.post('/save-jobseeker/:profileId', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.savedCandidates,
);

// recruiter confirm mail token endpoint
Router.get('/confirm-mail/:token', recruiterAuthController.confirmMail);

// recruiter reset password token endpoint
Router.patch('/reset-password/:token', recruiterAuthController.recruiterResetPassword);

module.exports = Router;
