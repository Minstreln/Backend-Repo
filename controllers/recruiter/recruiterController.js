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
const Recruiter = require('../../models/recruiter/recruiterAuthModel');
const JobListing = require('../../models/jobListing/jobListingModel');
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
        { name: 'companyLogo', maxCount: 1 },
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
                const originalName = file.originalname.split('.')[0];

                file.filename = `Recruiter-${originalName}-${req.user.id}-${Date.now()}.jpeg`;

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
        'companyLogo',
        'companyWebsite',
        'aboutUs',
    );

    if (req.files.employmentProof) {
        filteredBody.employmentProof = req.files.employmentProof[0].filename;
    }
        else {
        return next(new AppError('Please upload a proof of your employment at the company', 400));
    }

    if (req.files.companyLogo) {
        filteredBody.companyLogo = req.files.companyLogo[0].filename;
    }
        else {
        return next(new AppError('Please upload a company Logo', 400));
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

// Save a job seeeker profile logic
exports.savedCandidates = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const profileId = req.params.profileId;

    const user = await Recruiter.findById(userId);

    if(!user) {
        return next(new AppError('User profile does not exists'));
    };
    
    const profileExists = user.savedCandidates.includes(profileId);
    
    if(profileExists) {
        res.status(409).json({
            status: 'failed',
            message: 'This candidate profile has been saved before by you!'
        });
    } else {
        await Recruiter.updateOne(
            { _id: userId },
            { $push: { savedCandidates: profileId } }
        );

        res.status(200).json({
            status: 'success',
            message: 'Candidate saved successfully!',
        });
    };
});

// logic for a recruiter to get their saved Job seeker
exports.getSavedCandidates = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const user = await Recruiter.findById(userId).populate('savedCandidates');

    if (!user) {
        return next(new AppError('User not found', 404));
    };

    res.status(200).json({
        status: 'success',
        results: user.savedCandidates.length,
        data: {
            savedCandidates: user.savedCandidates,
        },
    });
});

// get open jobs related to a recruiter
exports.getOpenJobs = catchAsync(async (req, res, next) => {
    const recruiterId = req.user.id;

    const openJobs = await JobListing.find({
        status: 'open',
        recruiter: recruiterId,
    });

    if (!openJobs || openJobs.length === 0) {
        return next(new AppError('No jobs open for this recruiter'))
    }

    res.status(200).json({
        status: 'success',
        results: openJobs.length,
        data: {
            openJobs,
        },
    });
});






// get recruiter's personal details
exports.getPersonalDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const personalDetails = await RecruiterPersonalDetail.find({ user: userId });

    if (!personalDetails) {
        return next(new AppError, 'No personal details found for this user.' );
    };

    res.status(200).json({
        status: 'success',
        results: personalDetails.length,
        data: {
            personalDetails
        },
    });
});

// delete recruiter's personal details
exports.deletePersonalDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const personalDetailId = req.params.personalDetailId;

    const personalDetail = await RecruiterPersonalDetail.findOne({ _id: personalDetailId, user: userId });

    if (!personalDetail) {
        return next(new AppError, 'No personal details found for this user.' );
    };

    await personalDetail.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Update personal details
exports.updatePersonalDetail = catchAsync(async (req, res, next) => {
    const personalDetailId = req.params.personalDetailId;
    const userId = req.user.id;

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
        console.log('No profile Image file uploaded');
    }    

    const updatedPersonalDetail = await RecruiterPersonalDetail.findOneAndUpdate(
        { _id: personalDetailId, user: userId },
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedPersonalDetail) {
        return next(new AppError('No personal details found with that ID for this user.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            Personal: updatedPersonalDetail,
        },
    });
});












// get recruiter's experience details
exports.getExperienceDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const experienceDetails = await RecruiterExperience.find({ user: userId });

    if (!experienceDetails) {
        return next(new AppError, 'No experience details found for this user.' );
    };

    res.status(200).json({
        status: 'success',
        results: experienceDetails.length,
        data: {
            experienceDetails
        },
    });
});

// delete recruiter's experience details
exports.deleteExperienceDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const experienceDetailId = req.params.experienceDetailId;

    const experienceDetail = await RecruiterExperience.findOne({ _id: experienceDetailId, user: userId });

    if (!experienceDetail) {
        return next(new AppError, 'No Experience details found for this user.' );
    };

    await experienceDetail.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Update a specific experience detail by ID
exports.updateExperienceDetail = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const experienceDetailId = req.params.experienceDetailId;

    let experienceDetail = await RecruiterExperience.findOne({ _id: experienceDetailId, user: userId });

    if (!experienceDetail) {
        return next(new AppError('No experience detail found with that ID for this user.', 404));
    }

    experienceDetail = await RecruiterExperience.findOneAndUpdate(
        { _id: experienceDetailId, user: userId },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            experienceDetail,
        },
    });
});











// get recruiter's company details
exports.getCompanyDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const companyDetails = await CompanyDetail.find({ user: userId });

    if (!companyDetails) {
        return next(new AppError, 'No academic details found for this user.' );
    };

    res.status(200).json({
        status: 'success',
        results: companyDetails.length,
        data: {
            companyDetails
        },
    });
});

// delete recruiter's company details
exports.deleteCompanyDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const companyDetailId = req.params.companyDetailId;

    const companyDetail = await CompanyDetail.findOne({ _id: companyDetailId, user: userId });

    if (!companyDetail) {
        return next(new AppError, 'No academic details found for this user.' );
    };

    await companyDetail.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Update company details
exports.updateCompanyDetail = catchAsync(async (req, res, next) => {
    const companyDetailId = req.params.companyDetailId;
    const userId = req.user.id;

    const filteredBody = filterObj(
        req.body,
        'companyName',
        'location',
        'yearOfJoining',
        'employmentProof',
        'companyType',
        'companyLogo',
        'companyWebsite',
        'aboutUs',
    );

    if (req.files.employmentProof) {
        filteredBody.employmentProof = req.files.employmentProof[0].filename;
    }
        else {
        return next(new AppError('Please upload a proof of your employment at the company', 400));
    }

    if (req.files.companyLogo) {
        filteredBody.companyLogo = req.files.companyLogo[0].filename;
    }
        else {
        return next(new AppError('Please upload a company Logo', 400));
    }

    const updatedCompanyDetail = await CompanyDetail.findOneAndUpdate(
        { _id: companyDetailId, user: userId },
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCompanyDetail) {
        return next(new AppError('No company details found with that ID for this user.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            Company: updatedCompanyDetail,
        },
    });
});
