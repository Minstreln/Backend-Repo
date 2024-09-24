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


//////////////////////////// profile CRUD routes /////////////////////////

// get company detail
Router.get('/get-company-detail',    
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.getCompanyDetails
);

// delete company detail
Router.delete('/delete-company-detail/:companyDetailId',
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.deleteCompanyDetails
);

// update company detail
Router.patch('/update-company-detail/:companyDetailId', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.uploadRecruiterPhoto,
    recruiterController.resizeRecruiterPhoto,
    recruiterController.updateCompanyDetail
);

// get experience detail
Router.get('/get-experience-detail', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.getExperienceDetails
);

// delete experience detail
Router.delete('/delete-experience-detail/:experienceDetailId', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.deleteExperienceDetails
);

// update experience detail
Router.patch('/update-experience-detail/:experienceDetailId', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.updateExperienceDetail
);

// get personal detail
Router.get('/get-personal-detail',    
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.getPersonalDetails
);

// delete personal detail
Router.delete('/delete-personal-detail/:personalDetailId',
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.deletePersonalDetails
);

// update personal detail
Router.patch('/update-personal-detail/:personalDetailId', 
    recruiterAuthController.protect, 
    recruiterAuthController.restrictTo('recruiter'),
    recruiterController.uploadRecruiterPhoto,
    recruiterController.resizeRecruiterPhoto,
    recruiterController.updatePersonalDetail
);

///////////////////////////////////////////////////////////////////////////////

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
