const express = require('express');
const jobListingController = require('../../controllers/jobListing/jobListingController');
const adminAuthController = require('../../controllers/admin/adminAuthController');

const Router = express.Router();

// Enpoint to add Job listing
Router.post('/add-joblisting', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin', 'recruiter'),
    jobListingController.addJobListing
);

// Enpoint to get all Job listings
Router.get('/get-all-joblistings', jobListingController.getAllJobListing);

// Endpoint for recruiters to get jobs related (posted) by them
Router.get('/my-joblisting', 
  adminAuthController.protect,
  adminAuthController.restrictTo('recruiter', 'admin'),
  jobListingController.getRecruiterJobListings
);

//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// endpoint to get jobs by category
Router.get('/category/:categoryId', jobListingController.getJobsByCategory);

// Deactivate job listing by recruiter endpoint
Router.patch('/deactivate/:jobId', 
  adminAuthController.protect,
  adminAuthController.restrictTo('recruiter', 'admin'),
  jobListingController.deactivateJobListing
);

// update job listing status by recruiter endpoint
Router.patch('/status/:jobId', 
  adminAuthController.protect,
  adminAuthController.restrictTo('recruiter', 'admin'),
  jobListingController.updateJobStatus
);

//get single, update and delete Job listing endpoint
Router.route('/:id')
  .get(
    jobListingController.getJobListing
    )
  .patch(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin', 'recruiter'),
    jobListingController.updateJobListing
  )
  .delete(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin', 'recruiter'),
    jobListingController.deleteJobListing
  );

module.exports = Router;
