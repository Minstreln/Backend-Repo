const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const AppError = require('../../utils/appError');
const Admin = require('../../models/admin/adminModel');
const Recruiter = require('../../models/recruiter/recruiterAuthModel');
const JobSeeker = require('../../models/jobSeeker/jobSeekerAuthModel');
const catchAsync = require('../../utils/catchAsync');
const sendMail = require('../../utils/email');

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

  const filenameWithoutExtension = path.parse(req.file.originalname).name;

  req.file.filename = `admin-${filenameWithoutExtension}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/admin/${req.file.filename}`);

  next();
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000
    ), 
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// admin register logic
// exports.adminRegister = catchAsync(async (req, res, next) => {
//     const newAdmin = await Admin.create({
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         email: req.body.email,
//         password: req.body.password,
//         passwordConfirm: req.body.passwordConfirm,
//     });

//     createSendToken(newAdmin, 201, res);
// })

// admin login logic
exports.adminLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(admin, 200, res);
})

// admin logout logic
exports.adminLogout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
        message: "Logged out successfully",
    })
};

// admin protect middleware
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('Please log in to get access', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    let currentUser;

    currentUser = await Admin.findById(decoded.id);
  
    if (!currentUser) {
      currentUser = await Recruiter.findById(decoded.id);
    }

    if (!currentUser) {
        currentUser = await JobSeeker.findById(decoded.id);
    }

    if (!currentUser) {
        return next(new AppError('The token does not exist!', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
        new AppError('User recently changed password! Please log in again', 401)
        );
    }

    req.user = currentUser;
    next();
});

// admin check if logged in middleware
exports.isLoggedIn = async (req, res, next) => {
    req.locals = req.locals || {};
  
    if (req.cookies.jwt) {
      try {
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        const currentUser = await Admin.findById(decoded.id);
  
        if (!currentUser) {
          return next();
        }
  
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
  
        req.locals.user = currentUser;
        next();
      } catch (err) {
        return next();
      }
    }
    next();
};

// admin restrict to middlware
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action'),
        403
      );
    }
    next();
};

// admin forgot password logic
exports.adminForgotPassword = catchAsync(async (req, res, next) => {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return next(new AppError('Enter a valid Email address', 404));
    }
  
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });
  
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/admin/reset-password/${resetToken}`;
  
    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center;">
            <img src="" alt="Lysterpro Logo" style="max-width: 200px; margin-bottom: 20px;">
        </div>
        <h2 style="color: #333;">Forgot Your Password?</h2>
        <p>Hi ${admin.firstName},</p>
        <p>Forgot your password? Click the link below to reset it. This link is valid for 10 minutes:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${resetURL}" style="background-color: #0A65CC; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If the button above does not work, copy and paste the following link into your web browser:</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
        <p>If you didn't forget your password, please ignore this email.</p>
        <p>Thank you,<br>The Lysterpro Team</p>
        </div>
    </div>
    `;

  
    try {
      await sendMail({
        email: admin.email,
        subject: 'Your password reset token (Valid for only 10mins)',
        message,
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      admin.passwordResetToken = undefined;
      admin.passwordResetExpired = undefined;
      await admin.save({ validateBeforeSave: false });
  
      return next(
        new AppError('There was an error sending the email, try again later.'),
        500
      );
    }
  });

// admin reset password logic
exports.adminResetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
  
    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
  
    if (!admin) {
      return next(new AppError('Token is Invalid or has expired'), 400);
    }
  
    admin.password = req.body.password;
    admin.passwordConfirm = req.body.passwordConfirm;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
  
    createSendToken(admin, 200, res);
});

// admin update password logic
exports.adminUpdatePassword = catchAsync(async (req, res, next) => {
    const admin = await Admin.findById(req.user.id).select('+password');
  
    if (!(await admin.correctPassword(req.body.passwordCurrent, admin.password))) {
      return next(new AppError('Your current password is wrong', 401));
    }
  
    admin.password = req.body.password;
    admin.passwordConfirm = req.body.passwordConfirm;
    await admin.save();
  
    createSendToken(admin, 200, res);
});
