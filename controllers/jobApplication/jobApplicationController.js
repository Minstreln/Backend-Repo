const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AppError = require('../../utils/appError');
const Resume = require('../../models/jobSeeker/resumeModel');
const JobApplication = require('../../models/jobApplication/jobApplicationModel');
const catchAsync = require('../../utils/catchAsync');
// const factory = require('../handler/handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.fieldname === 'resume' && file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Please upload only PDF files for the resume field.', 400), false);
    }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadJobseekerResume = catchAsync(async (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new AppError('Too many files uploaded for the resume field', 400));
                }
            }
            return next(err);
        }

        if (req.file && !req.user.existingResume) {
            const file = req.file;
            const originalName = file.originalname.split('.')[0];
            const fileExtension = file.originalname.split('.').pop();

            file.filename = `${originalName}-${req.user.id}.${fileExtension}`;

            fs.writeFile(`public/img/jobApplication/${file.filename}`, file.buffer, (err) => {
                if (err) {
                    console.error('Error writing PDF file:', err);
                    return next(new AppError('Error saving the resume file.', 500));
                }
                req.filePath = file.filename;
                next();
            });
        } else {
            next();
        }
    });
});


exports.applyToJob = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;
    const jobseekerId = req.user.id;

    const existingResume = await Resume.findOne({ user: jobseekerId });

    if (existingResume) {
        console.log('Existing resume found:', existingResume.resume);
        req.filePath = existingResume.resume;
    } else {
        if (!req.file || req.file.fieldname !== 'resume') {
            return next(new AppError('You must upload a resume to apply for this job.', 400));
        }
        
        const newResume = new Resume({
            user: jobseekerId,
            resume: req.filePath,
        });

        await newResume.save();
    }

    const jobApplication = await JobApplication.create({
        job: jobId,
        jobSeeker: jobseekerId,
        resume: req.filePath,
        appliedOn: Date.now()
    });

    res.status(201).json({
        status: 'success',
        data: {
            jobApplication
        }
    });
});
