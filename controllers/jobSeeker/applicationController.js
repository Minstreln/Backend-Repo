const applicationModel = require('../../models/jobSeeker/applicationModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { body, validationResult } = require('express-validator');
const { notifyRecruiter } = require('../../utils/websocket');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

exports.createApplication = catchAsync(async (req, res, next) => {
    await body('jobListing').notEmpty().withMessage('Job listing is required').run(req);
    await body('resume').notEmpty().withMessage('Resume ID or URL is required').run(req);
    await body('coverLetter').notEmpty().withMessage('Cover letter is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { jobListing, resume, coverLetter, experience, personalDetails } = req.body;

    if (!resume || typeof resume !== 'string') {
        return next(new AppError('Invalid resume ID or URL', 400));
    }

    const newApplication = await applicationModel.create({
        jobListing,
        jobSeeker: req.user._id,
        experience,
        personalDetails,
        coverLetter,
        resume 
    });

    const populatedApplication = await applicationModel.findById(newApplication._id)
        .populate('jobListing')
        .populate('jobSeeker');

    notifyRecruiter(
        JSON.stringify({
            message: `New job application received from ${populatedApplication.jobSeeker.firstName} ${populatedApplication.jobSeeker.lastName}`,
            jobListing: populatedApplication.jobListing.position,
            ApplicantEmail: req.user.email,
        })
    );

    res.status(201).json({
        status: 'success',
        data: {
            application: populatedApplication
        }
    });
});

// Get all applications
exports.getAllApplications = catchAsync(async (req, res, next) => {
    const applications = await applicationModel.find().populate('jobListing').populate('jobSeeker');

    if (!applications) {
        return next(new AppError('No applications found', 404));
    }

    res.status(200).json({
        status: 'success',
        results: applications.length,
        data: {
            applications
        }
    });
});


// Get application by ID
exports.getApplicationById = catchAsync(async (req, res, next) => {
    const application = await applicationModel.findById(req.params.id)
        .populate('jobListing')
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

// Update application by ID
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

// Delete application by ID
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
