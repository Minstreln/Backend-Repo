// const multer = require('multer');
// const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
// const crypto = require('crypto');
// const sendMail = require('../../utils/email');
const AppError = require('../../utils/appError');
const PersonalDetail = require('../../models/jobSeeker/personalDetailModel');
const AcademicDetail = require('../../models/jobSeeker/academicDetailModel');
const Experience = require('../../models/jobSeeker/experienceModel');
const Resume = require('../../models/jobSeeker/resumeModel');
const catchAsync = require('../../utils/catchAsync');
const JobSeeker = require('../../models/jobSeeker/jobSeekerAuthModel');
// const factory = require('../handler/handlerFactory');

// const multerStorage = multer.memoryStorage();

// const multerFilter = (req, file, cb) => {
//     if (
//       file.mimetype.startsWith('image') ||
//       (file.mimetype === 'application/pdf' && ['certificate', 'resume'].includes(file.fieldname))
//     ) {
//       cb(null, true);
//     } else {
//       cb(new AppError('Please upload only images or PDF files for selected fields', 400), false);
//     }
// };   

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// exports.uploadJobseekerPhoto = catchAsync(async (req, res, next) => {
//     upload.fields([
//         { name: 'profileImage', maxCount: 1 },
//         { name: 'certificate', maxCount: 1 },
//         { name: 'resume', maxCount: 5 }
//     ])(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
//                 if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//                     return next(new AppError('Too many files uploaded for one or more fields', 400));
//                 }
//             }
//             return next(err);
//         }
//         next();
//     });
// });
  
// exports.resizeJobseekerPhoto = (req, res, next) => {
//     if (!req.files) {
//         return next();
//     }

//     Object.values(req.files).forEach((filesArray) => {
//         filesArray.forEach((file) => {
//             const isPdf = file.mimetype === 'application/pdf';

//             if (!isPdf) {
//                 file.filename = `Jobseeker-${req.user.id}-${Date.now()}.jpeg`;

//                 sharp(file.buffer)
//                     .resize(500, 500)
//                     .toFormat('jpeg')
//                     .jpeg({ quality: 90 })
//                     .toFile(`public/img/jobseeker/image/${file.filename}`)
//                     .then(() => {
//                     })
//                     .catch((err) => {
//                     });
//             } else {
//                 const originalName = file.originalname.split('.')[0];
//                 const fileExtension = file.originalname.split('.').pop();

//                 file.filename = `${originalName}-${req.user.id}-${Date.now()}.${fileExtension}`;

//                 fs.writeFile(`public/img/jobseeker/pdf/${file.filename}`, file.buffer, (err) => {
//                     if (err) {
//                     } else {
//                     }
//                 });
//             }
//         });
//     });

//     next();
// };

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
        'github',
        'linkedin',
        'portfolioSite',
        'aboutMe',
        'phoneNumber',
    );
    
    // if (req.files && req.files.profileImage) {
    //     filteredBody.profileImage = req.files.profileImage[0].filename;
    // } else {
    //     return next(new AppError('Please upload a profile picture', 400));
    // }

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

// Save a job listing logic
exports.savedJob = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const jobId = req.params.jobId;

    const user = await JobSeeker.findById(userId);

    if(!user) {
        return next(new AppError('User profile does not exists'));
    };
    
    const jobExists = user.savedJobs.includes(jobId);
    
    if(jobExists) {
        res.status(409).json({
            status: 'failed',
            message: 'This job listing has been saved before by you!'
        });
    } else {
        await JobSeeker.updateOne(
            { _id: userId },
            { $push: { savedJobs: jobId } }
        );

        res.status(200).json({
            status: 'success',
            message: 'Job listing saved successfully!',
        });
    };
});

// logic for a jobseeker to get their saved jobs
exports.getSavedJobs = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const user = await JobSeeker.findById(userId).populate('savedJobs');

    if (!user) {
        return next(new AppError('User not found', 404));
    };

    res.status(200).json({
        status: 'success',
        results: user.savedJobs.length,
        data: {
            savedJobs: user.savedJobs,
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
        'certificate',
        'course',
    );
    
    // if (req.files.certificate) {
    //     filteredBody.certificate = req.files.certificate[0].filename;
    // }
    //     else {
    //     return next(new AppError('Please upload certificate', 400));
    // }

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
        startDate: req.body.startDate,
        endDate: req.body.endDate,
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
    const filteredBody = filterObj(req.body, 'title', 'resume');

    if (!filteredBody.resume) {
        return next(new AppError('Resume file is required.', 400));
    }

    const newJobseekerResume = await Resume.create({
        resume: filteredBody.resume,
        title: filteredBody.title || filteredBody.resume,
        user: req.user.id,
    });

    res.status(200).json({
        status: 'success',
        data: {
            resumeDetails: newJobseekerResume,
        },
    });
});

// get jobseeker resume(s)
exports.getMyResume = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const userResume = await Resume.find({ user: userId });

    if(!userResume) {
        return next(new AppError('No resume found for you, please upload a resume', 404));
    };

    res.status(200).json({
        status: 'success',
        results: userResume.length,
        data: {
            userResume
        },
    });
});

// get jobseeker's academic details
exports.getAcademicDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const academicDetails = await AcademicDetail.find({ user: userId });

    if (!academicDetails) {
        return next(new AppError, 'No academic details found for this user.' );
    };

    res.status(200).json({
        status: 'success',
        results: academicDetails.length,
        data: {
            academicDetails
        },
    });
});

// delete jobseeker's academic details
exports.deleteAcademicDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const academicDetailId = req.params.academicDetailId;

    const academicDetail = await AcademicDetail.findOne({ _id: academicDetailId, user: userId });

    if (!academicDetail) {
        return next(new AppError, 'No academic details found for this user.' );
    };

    await academicDetail.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Update academic details
exports.updateAcademicDetail = catchAsync(async (req, res, next) => {
    const academicDetailId = req.params.academicDetailId;
    const userId = req.user.id;

    const filteredBody = filterObj(
        req.body,
        'institutionName',
        'location',
        'yearOfCompletion',
        'certificate',
        'course'
    );

    // if (req.files && req.files.certificate) {
    //     filteredBody.certificate = req.files.certificate[0].filename;
    // } else {
    //     console.log('No certificate file uploaded');
    // }    

    const updatedAcademicDetail = await AcademicDetail.findOneAndUpdate(
        { _id: academicDetailId, user: userId },
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedAcademicDetail) {
        return next(new AppError('No academic details found with that ID for this user.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            Academics: updatedAcademicDetail,
        },
    });
});

// update jobseekers resume
exports.updateJobseekerResume = catchAsync(async (req, res, next) => {
    const resumeId = req.params.resumeId;
    const userId = req.user.id;

    const filteredBody = filterObj(req.body, 'resume', 'title');

    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
        return next(new AppError('No resume found with that ID for this user.', 404));
    }

    const updatedResume = await Resume.findOneAndUpdate(
        { _id: resumeId, user: userId },
        {
            resume: filteredBody.resume || resume.resume,
            title: filteredBody.title || resume.title,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedResume) {
        return next(new AppError('Failed to update the resume. Please try again.', 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            resume: updatedResume,
        },
    });
});


// delete jobseeker resume(s)
exports.deleteJobseekerResume = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const resumeId = req.params.resumeId;
    
    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
        return next(new AppError('No resume found with that ID for this user.', 404));
    }

    await resume.remove();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// get jobseeker's experience details
exports.getExperienceDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const experienceDetails = await Experience.find({ user: userId });

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

// delete jobseeker's experience details
exports.deleteExperienceDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const experienceDetailId = req.params.experienceDetailId;

    const experienceDetail = await Experience.findOne({ _id: experienceDetailId, user: userId });

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

    let experienceDetail = await Experience.findOne({ _id: experienceDetailId, user: userId });

    if (!experienceDetail) {
        return next(new AppError('No experience detail found with that ID for this user.', 404));
    }

    experienceDetail = await Experience.findOneAndUpdate(
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

// get jobseeker's personal details
exports.getPersonalDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const personalDetails = await PersonalDetail.findOne({ user: userId }).populate(
        'user'
    );

    if (!personalDetails) {
        return next(new AppError('No personal details found for this user.'));
    };

    res.status(200).json({
        status: 'success',
        results: personalDetails.length,
        data: {
            personalDetails
        },
    });
});

// delete jobseeker's personal details
exports.deletePersonalDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const personalDetailId = req.params.personalDetailId;

    const personalDetail = await PersonalDetail.findOne({ _id: personalDetailId, user: userId });

    if (!personalDetail) {
        return next(new AppError('No personal details found for this user.'));
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
        'github',
        'linkedin',
        'portfolioSite',
        'aboutMe',
        'phoneNumber',
    );

    // if (req.files && req.files.profileImage) {
    //     filteredBody.profileImage = req.files.profileImage[0].filename;
    // } else {
    //     console.log('No profile Image file uploaded');
    // }    

    const updatedPersonalDetail = await PersonalDetail.findOneAndUpdate(
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


// update jobseeker credentials
exports.updateJobseekerDetails = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    if(!userId) {
        return next(new AppError('User not found', 404));
    };

    const filteredBody = filterObj(
        req.body,
        'firstName',
        'lastName',
        'phoneNumber',
    );   

    const updatedJobseekerDetail = await JobSeeker.findOneAndUpdate(
        { _id: userId },
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedJobseekerDetail,
        },
    });
});
