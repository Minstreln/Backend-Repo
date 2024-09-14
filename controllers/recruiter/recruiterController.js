const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
// const crypto = require('crypto');
// const sendMail = require('../../utils/email');
const AppError = require('../../utils/appError');
const RecruiterPersonalDetail = require('../../models/recruiter/personalDetailModel');
const CompanyDetail = require('../../models/recruiter/companyDetailModel');
const RecruiterExperience = require('../../models/recruiter/experienceModel');
const catchAsync = require('../../utils/catchAsync');
// const factory = require('../handler/handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (
      file.mimetype.startsWith('image') ||
      (file.mimetype === 'application/pdf' && ['employmentProof'].includes(file.fieldname))
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

exports.uploadRecruiterPhoto = catchAsync(async (req, res, next) => {
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'employmentProof', maxCount: 1 },
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
  
exports.resizeRecruiterPhoto = (req, res, next) => {
    if (!req.files) {
        return next();
    }

    Object.values(req.files).forEach((filesArray) => {
        filesArray.forEach((file) => {
            const isPdf = file.mimetype === 'application/pdf';

            if (!isPdf) {
                file.filename = `Recruiter-${req.user.id}-${Date.now()}.jpeg`;

                sharp(file.buffer)
                    .resize(500, 500)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/recruiter/image/${file.filename}`)
                    .then(() => {
                    })
                    .catch((err) => {
                    });
            } else {
                const originalName = file.originalname.split('.')[0];
                const fileExtension = file.originalname.split('.').pop();

                file.filename = `${originalName}-${req.user.id}.${fileExtension}`;

                fs.writeFile(`public/img/recruiter/pdf/${file.filename}`, file.buffer, (err) => {
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

// update recruiter personal details after sign up
exports.recruiterPersonalDetail = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(
        req.body,
        'profileImage',
        'middleName',
        'location',
        'linkedAccount',
    );
    
    if (req.files && req.files.profileImage) {
        filteredBody.profileImage = req.files.profileImage[0].filename;
    } else {
        return next(new AppError('Please upload a profile picture', 400));
    }

    const newRecruiterPersonalDetail = await RecruiterPersonalDetail.create({
        ...filteredBody,
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: newRecruiterPersonalDetail,
        },
    });
});


// recruiter company details
exports.recruiterCompanyDetail = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(
        req.body,
        'companyName',
        'location',
        'yearOfJoining',
        'employmentProof',
        'companyType',
    );

    if (req.files.employmentProof) {
        filteredBody.employmentProof = req.files.employmentProof[0].filename;
    }
        else {
        return next(new AppError('Please upload a proof of your employment at the company', 400));
    }

    const newRecruiterCompanyDetail = await CompanyDetail.create({
        ...filteredBody,
        user: req.user.id
    });

    res.status(200).json({
        status: 'success',
        data: {
            CompanyDetails: newRecruiterCompanyDetail,
        },
    });
});


// recruiter work experiene logic
exports.recruiterExperience = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const newRecruiterExperience = await RecruiterExperience.create({
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
            Experience: newRecruiterExperience,
        },
    });
});
