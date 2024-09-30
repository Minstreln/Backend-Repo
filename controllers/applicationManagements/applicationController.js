const mongoose = require('mongoose');
const Application = require('../../models/applicationModels');
const APIFeatures = require('../../utils/apiFeatures');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');


// Get applications for a specific job
const getApplications = catchAsync(async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const features = new APIFeatures(
      Application.find({ job: jobId }).populate('jobSeeker'),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const applications = await features.query;

    // Respond with the list of applications
    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
      },
    });
  } catch (error) {
    next(error); 
  }
});


// Update the status of an application
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['accepted', 'interviewed', 'rejected', 'pending'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  // Find the application
  const application = await Application.findById(id);

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
  }

  application.status = status;
  await application.save();

  // Send email to job seeker
  await sendMail({
    to: application.jobSeeker.email,
    subject: 'Application Status Update',
    text: `Dear ${application.jobSeeker.firstName} ${application.jobSeeker.lastName},\n\nYour application status has been updated to "${status}".\n\nBest regards`,
  });

  res.status(200).json({
    status: 'success',
    data: {
      application,
    },
  });
});

// Get a single application by ID
const getApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid application ID', 400));
  }

  const application = await Application.findById(id).populate('jobSeeker');

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
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
  getApplication,
};
