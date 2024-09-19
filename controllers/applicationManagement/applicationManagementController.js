
const Application = require('../../models/jobSeeker/applicationModel');
const APIFeatures = require('../../utils/apiFeatures');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');

const getApplications = catchAsync(async (req, res, next) => {
  try {
  
    // console.log('Logged-in user ID:', req.user.id);

    const allApplications = await Application.find()
      .populate('jobListing')  
      .populate('jobSeeker');  

    // console.log('Fetched applications:', JSON.stringify(allApplications, null, 2));

    const filteredApplications = allApplications.filter(app => {
      const recruiterId = app.jobListing?.recruiter; 
      return recruiterId && recruiterId.toString() === req.user.id.toString();
    });

    // console.log('Filtered applications:', JSON.stringify(filteredApplications, null, 2));

    res.status(200).json({
      status: 'success',
      results: filteredApplications.length,
      data: {
        applications: filteredApplications
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});


// Get a single application by ID
const getApplicationById = catchAsync(async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobListing')
      .populate('jobSeeker');
      
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the application is related to the recruiter
    const recruiterId = application.jobListing?.recruiter;
    if (!recruiterId || recruiterId.toString() !== req.user.id.toString()) {
      return next(new AppError('You are not authorized to access this application', 403));
    }

    res.status(200).json({ application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});


// Get all applications for a specific job
const getApplicationsByJob = catchAsync(async (req, res, next) => {
  const { jobListingId } = req.params;

  // Fetch applications related to the specified job listing ID
  const applications = await Application.find({ jobListing: jobListingId })
    .populate('jobListing')
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

  const validStatuses = ['Applied', 'Reviewed', 'Interviewed', 'Hired', 'Rejected'];

  // Check if the provided status is valid
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  // Find and populate the application
  const application = await Application.findById(id).populate('jobSeeker');

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
  }

  if (!application.jobSeeker || !application.jobSeeker.email) {
    console.error('Job Seeker Details:', application.jobSeeker);
    return next(new AppError('Job seeker email not found', 500));
  }

  // Update the application status
  application.status = status;
  await application.save();

  // Send email to job seeker
  try {
    await sendMail({
      to: application.jobSeeker.email,
      subject: 'Application Status Update',
      html: `<p>Dear ${application.jobSeeker.firstName} ${application.jobSeeker.lastName},</p>
             <p>Your application status has been updated to "<strong>${status}</strong>".</p>
             <p>Best regards</p>`,
    });
  } catch (emailError) {
    console.error(`Failed to send email: ${emailError.message}`);
    return next(new AppError('Failed to send email to job seeker', 500));
  }

  // Send response to the client
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
