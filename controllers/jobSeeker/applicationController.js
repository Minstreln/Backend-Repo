const applicationModel = require('../../models/jobSeeker/applicationModel');
const jobListingModel = require('../../models/jobListing/jobListingModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { notifyRecruiter } = require('../../utils/websocket');

// Create a job application
exports.createApplication = catchAsync(async (req, res, next) => {
    const { jobListing, experience, personalDetails, coverLetter } = req.body;

    // Find the job listing to get the recruiter ID
    const job = await jobListingModel.findById(jobListing);

    if (!job) {
        return next(new AppError('Job listing not found', 404));
    }

    // Create application in the database
    const newApplication = await applicationModel.create({
        jobListing,
        jobSeeker: req.user._id,
        experience,
        personalDetails,
        coverLetter,
        resume: req.file.path  // Assuming multer is handling the resume upload
    });

    // Populate fields and notify the recruiter
    const populatedApplication = await applicationModel.findById(newApplication._id)
        .populate('jobListing')
        .populate('jobSeeker');

    // Send notification to the recruiter who posted the job
    notifyRecruiter(
        job.recruiter,  // Recruiter ID from the job listing
        JSON.stringify({
            message: `New job application received from ${populatedApplication.jobSeeker.firstName} ${populatedApplication.jobSeeker.lastName}`,
            jobListing: populatedApplication.jobListing.position,
            applicantEmail: req.user.email,
        })
    );

    // Send successful response
    res.status(201).json({
        status: 'success',
        data: {
            application: populatedApplication
        }
    });
});
