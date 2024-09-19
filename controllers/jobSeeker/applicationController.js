const applicationModel = require('../../models/jobSeeker/applicationModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { body, validationResult } = require('express-validator');

// Create a new job application
exports.createApplication = catchAsync(async (req, res, next) => {
    await body('jobListing').notEmpty().withMessage('Job listing is required').run(req);
    await body('coverLetter').notEmpty().withMessage('Cover letter is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { jobListing, experience, personalDetails, coverLetter, resume } = req.body;

    // Create the job application with the logged-in user
    const newApplication = await applicationModel.create({
        jobListing,
        jobSeeker: req.user._id,
        experience,
        personalDetails,
        coverLetter,
        resume
    });

    // Populate the jobListing field to get the full data
    const populatedApplication = await applicationModel.findById(newApplication._id)
        .populate('jobListing')  // Make sure 'jobListing' is the field name in your model
        .populate('jobSeeker');

    res.status(201).json({
        status: 'success',
        data: {
            application: populatedApplication
        }
    });
});

// Get all applications
exports.getAllApplications = catchAsync(async (req, res, next) => {
    const applications = await applicationModel.find()
        .populate('jobListing')  // Make sure 'jobListing' is the field name in your model
        .populate('jobSeeker');

    res.status(200).json({
        status: 'success',
        results: applications.length,
        data: {
            applications
        }
    });
});


// Get a single application by ID
exports.getApplicationById = catchAsync(async (req, res, next) => {
    const application = await applicationModel.findById(req.params.id)
        .populate('job')
        .populate('jobSeeker');

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            application
        }
    });
});

// Update an application by ID
exports.updateApplication = catchAsync(async (req, res, next) => {
    const application = await applicationModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            application
        }
    });
});

// Delete an application by ID
exports.deleteApplication = catchAsync(async (req, res, next) => {
    const application = await applicationModel.findByIdAndDelete(req.params.id);

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
