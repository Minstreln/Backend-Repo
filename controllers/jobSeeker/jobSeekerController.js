const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
// const crypto = require('crypto');
// const twilio = require('twilio');
// const sendMail = require('../../utils/email');
const AppError = require('../../utils/appError');
const PersonalDetail = require('../../models/jobSeeker/personalDetailModel');
const AcademicDetail = require('../../models/jobSeeker/academicDetailModel');
const Experience = require('../../models/jobSeeker/experienceModel');
const Resume = require('../../models/jobSeeker/resumeModel');
// const Review = require('../../models/review/reviewModel');
const catchAsync = require('../../utils/catchAsync');
// const factory = require('../handler/handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (
      file.mimetype.startsWith('image') ||
      (file.mimetype === 'application/pdf' && ['highSchCertificate', 'degreeCertificate', 'resume'].includes(file.fieldname))
    ) {
      cb(null, true);
    } else {
      cb(new AppError('Please upload only images or PDF files for selected fields', 400), false);
    }
};   

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadJobseekerPhoto = catchAsync(async (req, res, next) => {
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'highSchCertificate', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new AppError('Too many files uploaded for one or more fields', 400));
                }
            }
            return next(err);
        }
        next();
    });
});
  
exports.resizeJobseekerPhoto = (req, res, next) => {
    if (!req.files) {
        return next();
    }

    Object.values(req.files).forEach((filesArray) => {
        filesArray.forEach((file) => {
            const isPdf = file.mimetype === 'application/pdf';

            if (!isPdf) {
                file.filename = `Jobseeker-${req.user.id}-${Date.now()}.jpeg`;

                sharp(file.buffer)
                    .resize(500, 500)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/jobseeker/image/${file.filename}`)
                    .then(() => {
                    })
                    .catch((err) => {
                    });
            } else {
                const originalName = file.originalname.split('.')[0];
                const fileExtension = file.originalname.split('.').pop();

                file.filename = `${originalName}-${req.user.id}.${fileExtension}`;

                fs.writeFile(`public/img/jobseeker/pdf/${file.filename}`, file.buffer, (err) => {
                    if (err) {
                    } else {
                    }
                });
            }
        });
    });

    next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// update jobseeker personal details after sign up
exports.jobseekerPersonalDetail = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(
        req.body,
        'profileImage',
        'middleName',
        'location',
        'linkedAccount',
        'aboutMe',
    );
    
    if (req.files && req.files.profileImage) {
        filteredBody.profileImage = req.files.profileImage[0].filename;
    } else {
        return next(new AppError('Please upload a profile picture', 400));
    }

    const newJobseekerPersonalDetail = await PersonalDetail.create({
        ...filteredBody,
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: newJobseekerPersonalDetail,
        },
    });
});


// jobseeker academics details
exports.jobseekerAcademicDetail = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(
        req.body,
        'institutionName',
        'location',
        'yearOfCompletion',
        'highSchCertificate',
        'degreeCertificate',
        'course',
    );
    
    if (req.files) {
        if (req.files.highSchCertificate) {
            filteredBody.highSchCertificate = req.files.highSchCertificate[0].filename;
        }
        if (req.files.degreeCertificate) {
            filteredBody.degreeCertificate = req.files.degreeCertificate[0].filename;
        }
         else {
            return next(new AppError('Please upload certificate', 400));
        }
    }

    const newJobseekerAcademicDetail = await AcademicDetail.create({
        ...filteredBody,
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        data: {
            Academics: newJobseekerAcademicDetail,
        },
    });
});

// jobseeker work experiene logic
exports.jobseekerExperience = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const newJobseekerExperience = await Experience.create({
        role: req.body.role,
        typeOfRole: req.body.typeOfRole,
        company: req.body.company,
        typeOfOrg: req.body.typeOfOrg,
        location: req.body.location,
        duration: req.body.duration,
        currentWorkPlace: req.body.currentWorkPlace,
        user: userId
    });

    res.status(200).json({
        status: 'success',
        data: {
            Experience: newJobseekerExperience,
        },
    });
});

// jobseeker upload resume
exports.jobseekerResume = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(
        req.body,
        'resume',
    );
    
    if (req.files.resume) {
        filteredBody.resume = req.files.resume[0].filename;
    }
    else {
        return next(new AppError('Please upload your resume', 400));
    }

    const newJobseekerResume = await Resume.create({
        ...filteredBody,
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        data: {
            resumeDetails: newJobseekerResume,
        },
    });
});
