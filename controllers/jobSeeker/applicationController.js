const applicationModel = require('../../models/jobSeeker/applicationModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { body, validationResult } = require('express-validator');
const { notifyRecruiter } = require('../../utils/websocket');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'public/img/uploads/resumes';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new AppError('Only PDF files are allowed', 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

exports.uploadResume = upload.single('resume');

// Create a job application
exports.createApplication = catchAsync(async (req, res, next) => {
    // Validate input fields
    await body('jobListing').notEmpty().withMessage('Job listing is required').run(req);
    await body('coverLetter').notEmpty().withMessage('Cover letter is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    // Check for uploaded file
    if (!req.file) {
        return next(new AppError('Please upload a PDF resume', 400));
    }

    // Create application in the database
    const { jobListing, experience, personalDetails, coverLetter } = req.body;
    const newApplication = await applicationModel.create({
        jobListing,
        jobSeeker: req.user._id,
        experience,
        personalDetails,
        coverLetter,
        resume: req.file.path 
    });

    // Populate fields and notify recruiter
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

    // Send successful response
    res.status(201).json({
        status: 'success',
        data: {
            application: populatedApplication
        }
    });
});

// Get all applications
exports.getAllApplications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    if(!userId) {
        return next(new AppError('User not found', 404));
    }

    const applications = await applicationModel.find({ jobSeeker: userId }).populate('jobListing').populate('jobSeeker');

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
    const userId = req.user.id;

    if(!userId) {
        return next(new AppError('User not found', 404));
    }

    const application = await applicationModel.findOneAndUpdate(
        {
            _id: req.params.id,
            jobSeeker: userId
        },
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
