const express = require('express');
const jobListingController = require('../../controllers/jobListing/jobListingController');
const adminAuthController = require('../../controllers/admin/adminAuthController');

const Router = express.Router();

// Enpoint to add Job listing
Router.post('/add-joblisting', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin', 'Recruiter'),
    jobListingController.addJobListing
);

// Enpoint to get all Job listings
Router.get('/get-all-joblistings', jobListingController.getAllJobListing);

//////////////////////////////// GENERIC ROUTES ////////////////////////////////////////

// endpoint to get jobs by category
Router.get('/category/:categoryId', jobListingController.getJobsByCategory);

//get single, update and delete Job listing endpoint
Router.route('/:id')
  .get(
    jobListingController.getJobListing
    )
  .patch(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin', 'Recruiter'),
    jobListingController.updateJobListing
  )
  .delete(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin', 'Recruiter'),
    jobListingController.deleteJobListing
  );

module.exports = Router;
