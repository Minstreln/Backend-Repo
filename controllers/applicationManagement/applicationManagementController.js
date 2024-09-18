const mongoose = require('mongoose');
const Application = require('../../models/applicationManagements/applicationManagementModels');
const applicationModel = require('../../models/jobSeeker/applicationModel');
const APIFeatures = require('../../utils/apiFeatures');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');

// Get all applications
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job') 
      .populate('jobSeeker');

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


// Get a single application by ID
const getApplicationById = async (req, res) => {
  try {
      const application = await Application.findById(req.params.id)
          .populate('job') 
          .populate('applicant');

      if (!application) {
          return res.status(404).json({ message: 'Application not found' });
      }

      res.status(200).json({ application });
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get all applications for a specific job
const getApplicationsByJob = catchAsync(async (req, res, next) => {
  const { jobListingId } = req.params;

  const applications = await Application.find({ jobListing: jobListingId })
    .populate('job')
    .populate('jobSeeker');

  if (!applications || applications.length === 0) {
    return next(new AppError('No applications found for this job listing', 404));
  }

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications
    }
  });
});

// Update the status of an application
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['accepted', 'interviewed', 'rejected', 'pending'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  // Find and populate the application
  const application = await Application.findById(id).populate('applicant');

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
  }

  // Check if the applicant's details are populated
  if (!application.applicant || !application.applicant.email) {
    console.error('Job Seeker Details:', application.applicant);
    return next(new AppError('Job seeker email not found', 500));
  }

  application.status = status;
  await application.save();

  // Send email to job seeker
  try {
    await sendMail({
      to: application.applicant.email,
      subject: 'Application Status Update',
      html: `<p>Dear ${application.applicant.firstName} ${application.applicant.lastName},</p>
             <p>Your application status has been updated to "<strong>${status}</strong>".</p>
             <p>Best regards</p>`,
    });
    
  } catch (emailError) {
    console.error(`Failed to send email: ${emailError.message}`);
    return next(new AppError('Failed to send email to job seeker', 500));
  }

  res.status(200).json({
    status: 'success',
    data: {
      application,
    },
  });
});


module.exports = {
  getApplications,
  updateApplicationStatus,
  getApplicationById,
  getApplicationsByJob,
};
