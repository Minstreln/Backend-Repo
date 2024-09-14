const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const cron = require('node-cron');
const AppError = require('../../utils/appError');
const Admin = require('../../models/admin/adminModel');
const JobSeeker = require('../../models/jobSeeker/jobSeekerAuthModel');
const Recruiter = require('../../models/recruiter/recruiterAuthModel');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../handler/handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please upload only Images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadAdminPhoto = upload.single('photo');

exports.resizeAdminPhoto = (req, res, next) => {
  if (!req.file) return next();

  if (req.user.photo) {
    const existingPhotoPath = path.join('public/img/admin', req.user.photo);
    if (fs.existsSync(existingPhotoPath)) {
      fs.unlinkSync(existingPhotoPath);
    }
  }

  req.file.filename = `admin-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/admin/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// admin update me logic
exports.AdminUpdateMe = async (req, res, next) => {
    const filteredBody = filterObj(req.body , 'email', 'photo', 'firstName', 'lastName');
  
    if (req.file) filteredBody.photo = req.file.filename;
  
    const updateAdmin = await Admin.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updateAdmin,
      },
    });
};
 
// ban job seekers or recruiters
exports.banUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  let user = await JobSeeker.findById(userId);

  if (user) {
    await JobSeeker.updateOne(
      { _id: userId },
      { $set: { isBanned: true } }
    );
  } else {
    user = await Recruiter.findById(userId);

    if (user) {
      await Recruiter.updateOne(
        { _id: userId },
        { $set: { isBanned: true } }
      );
    } else {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'User has been banned!',
  });
});

// unban job seekers or recruiters
exports.unBanUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  let user = await JobSeeker.findById(userId);

  if (user) {
    await JobSeeker.updateOne(
      { _id: userId },
      { $set: { isBanned: false } }
    );
  } else {
    user = await Recruiter.findById(userId);

    if (user) {
      await Recruiter.updateOne(
        { _id: userId },
        { $set: { isBanned: false } }
      );
    } else {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'User has been unbanned!',
  });
});

// suspend users 
exports.suspendUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { suspensionDuration } = req.body;
  
  let suspendedUntil = null;
  let isSuspendedPermanently = false;

  if (suspensionDuration === 'permanent') {
    isSuspendedPermanently = true;
  } else {
    switch (suspensionDuration) {
      case '1 week':
        suspendedUntil = moment().add(1, 'weeks').toDate();
        break;
      case '10 minutes':
        suspendedUntil = moment().add(10, 'minutes').toDate();
        break;
      case '2 weeks':
        suspendedUntil = moment().add(2, 'weeks').toDate();
        break;
      case '1 month':
        suspendedUntil = moment().add(1, 'months').toDate();
        break;
      default:
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid suspension duration',
        });
    }
  }

  let user = await JobSeeker.findById(userId);

  if (user) {
    await JobSeeker.updateOne(
      { _id: userId },
      {
        $set: {
          isSuspendedPermanently,
          suspendedUntil
        }
      }
    );
  } else {
    user = await Recruiter.findById(userId);

    if (user) {
      await Recruiter.updateOne(
        { _id: userId },
        {
          $set: {
            isSuspendedPermanently,
            suspendedUntil
          }
        }
      );
    } else {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: `This user has been suspended for ${suspensionDuration}!`,
  });
});

// unsuspend users
exports.unsuspendUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  
  let user = await JobSeeker.findById(userId);

  if (user) {
    await JobSeeker.updateOne(
      { _id: userId },
      {
        $set: {
          isSuspendedPermanently: false,
          suspendedUntil: null
        }
      }
    );
  } else {
    user = await Recruiter.findById(userId);

    if (user) {
      await Recruiter.updateOne(
        { _id: userId },
        {
          $set: {
            isSuspendedPermanently: false,
            suspendedUntil: null
          }
        }
      );
    } else {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'User has been unsuspended!',
  });
});

// get admin details
exports.adminGetMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// get all jobseeker logic
exports.getAllJobseeker = factory.getAll(JobSeeker);

// get one jobseeker logic
exports.getJobseeker = factory.getOne(JobSeeker);

// delete jobseeker logic
exports.deleteJobseeker = factory.deleteOne(JobSeeker);

// get all recruiters logic
exports.getAllRecruiter = factory.getAll(Recruiter);

// get one recruiter logic
exports.getRecruiter = factory.getOne(Recruiter);

// delete recruiters logic
exports.deleteRecruiter = factory.deleteOne(Recruiter);

///////////////////////////////// CRON JOB /////////////////////////////////////////

// Function to unsuspend users automatically
const unsuspendUsers = async () => {
    console.log(`Running unsuspend users task at ${new Date().toLocaleTimeString()}...`);
  
    try {
      const unsuspendedJobseekers = await JobSeeker.updateMany(
        { 
          isSuspendedPermanently: false, 
          suspendedUntil: { $lt: new Date() } 
        },
        {
          $set: {
            isSuspendedPermanently: false,
            suspendedUntil: null
          }
        }
    );
  
    console.log(`Unsuspended ${unsuspendedJobseekers.nModified} jobseekers at ${new Date().toLocaleTimeString()}.`);

    const unsuspendedRecruiters = await Recruiter.updateMany(
    { 
        isSuspendedPermanently: false, 
        suspendedUntil: { $lt: new Date() } 
    },
    {
        $set: {
        isSuspendedPermanently: false,
        suspendedUntil: null
        }
    }
    );

    console.log(`Unsuspended ${unsuspendedRecruiters.nModified} recruiters at ${new Date().toLocaleTimeString()}.`);
      
    } catch (error) {
      console.error('Error occurred while unsuspending users:', error);
      setTimeout(unsuspendUsers, 1000);
    }
};

const unsuspendUsersTask = cron.schedule('* * * * *', unsuspendUsers);

unsuspendUsersTask.start();
