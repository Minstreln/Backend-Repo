const express = require('express');
const jobSeekerAuthController = require('../../controllers/jobSeeker/jobSeekerAuthController');
const jobseekerFbAuthController = require('../../controllers/jobSeeker/oauth/jobSeekerFbAuthController');
const jobseekerGoogleAuthController = require('../../controllers/jobSeeker/oauth/jobSeekerGoogleAuthController');
const jobSeekerController = require('../../controllers/jobSeeker/jobSeekerController');

const Router = express.Router();

// jobseeker signup endpoint
Router.post('/signup', jobSeekerAuthController.jobSeekerSignup);

// jobseeker signin endpoint
// Router.post('/signin', jobSeekerAuthController.jobSeekerSignin);

// jobseeker logout endpoint
Router.get('/logout', jobSeekerAuthController.jobSeekerLogout);



/////////////////////////////// GOOGLE OAUTH ENDPOINTS /////////////////////////////////

// Google initialisation endpoint
Router.get('/auth/google', jobseekerGoogleAuthController.jobseekerGoogleAuthInit);

// Google callback endpoint
Router.get('/auth/google/callback', jobseekerGoogleAuthController.jobseekerGoogleAuthCallback);

/////////////////////////////// FACEBOOK OAUTH ENDPOINTS /////////////////////////////////

// Facebook initialisation endpoint
Router.get('/auth/facebook', jobseekerFbAuthController.jobseekerFbAuthInit);

// Facebook callback endpoint
Router.get('/auth/facebook/callback', jobseekerFbAuthController.jobseekerFbAuthCallback);



// jobseeker forgot password endpoint
Router.post('/forgot-password', jobSeekerAuthController.jobSeekerForgotPassword);

// jobseeker update password endpoint
Router.patch('/update-password', 
    jobSeekerAuthController.protect,
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerAuthController.jobSeekerUpdatePassword
);

// jobseeker update personal detail endpoint
Router.post('/personal-detail',
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'), 
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.jobseekerPersonalDetail
);

// jobseeker update academic detail endpoint
Router.post('/academic-detail',
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'), 
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.jobseekerAcademicDetail
);

// jobseeker update experience detail endpoint
Router.post('/experience',
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.jobseekerExperience
);


//////////////////////////// profile CRUD routes /////////////////////////

// get academic detail
Router.get('/get-academic-detail', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.getAcademicDetails
);

// delete academic detail
Router.delete('/delete-academic-detail/:academicDetailId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.deleteAcademicDetails
);

// update academic detail
Router.patch('/update-academic-detail/:academicDetailId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.updateAcademicDetail
);

// get experience detail
Router.get('/get-experience-detail', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.getExperienceDetails
);

// delete experience detail
Router.delete('/delete-experience-detail/:experienceDetailId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.deleteExperienceDetails
);

// update experience detail
Router.patch('/update-experience-detail/:experienceDetailId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.updateExperienceDetail
);

// get personal detail
Router.get('/get-personal-detail', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.getPersonalDetails
);

// delete personal detail
Router.delete('/delete-personal-detail/:personalDetailId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.deletePersonalDetails
);

// update personal detail
Router.patch('/update-personal-detail/:personalDetailId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.updatePersonalDetail
);


///////////////////////////////////////////////////////////////////////////////

// jobseeker upload resume endpoint
Router.post('/resume',
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.jobseekerResume
);

// get a jobseeker's resume(s)
Router.get('/myResume', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.getMyResume
);

// update a jobseeker resume endpoint
Router.patch('/update-resume/:resumeId',
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.uploadJobseekerPhoto,
    jobSeekerController.resizeJobseekerPhoto,
    jobSeekerController.updateJobseekerResume
);

// delete a jobseeker's resume(s)
Router.delete('/delete-resume/:resumeId', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.deleteJobseekerResume
);

Router.get('/saved-jobs', 
    jobSeekerAuthController.protect, 
    jobSeekerAuthController.restrictTo('job seeker'),
    jobSeekerController.getSavedJobs,
);
  
//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// save job listing to savedjobs
Router.post('/save-job/:jobId', 
  jobSeekerAuthController.protect, 
  jobSeekerAuthController.restrictTo('job seeker'),
  jobSeekerController.savedJob,
);

// jobseeker confirm mail token endpoint
Router.get('/confirm-mail/:token', jobSeekerAuthController.confirmMail);

// jobseeker reset password token endpoint
Router.patch('/reset-password/:token', jobSeekerAuthController.jobSeekerResetPassword);

module.exports = Router;
