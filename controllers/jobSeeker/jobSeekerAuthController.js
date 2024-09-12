const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const AppError = require('../../utils/appError');
const JobSeeker = require('../../models/jobSeeker/jobSeekerAuthModel');
const catchAsync = require('../../utils/catchAsync');
const sendMail = require('../../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res, jsonResponse) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    ...jsonResponse,
    token,
    data: {
      user,
    },
  });
};

// jobseeker signup logic
exports.jobSeekerSignup = catchAsync(async (req, res) => {
    const confirmationTokenExpiration = new Date(Date.now() + 5 * 60 * 1000);
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const newJobSeeker = await JobSeeker.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        terms: req.body.terms,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        confirmationToken: confirmationToken,
        confirmationTokenExpiration: confirmationTokenExpiration,
        createdAt: new Date(),
    });

    const confirmationLink = `${req.protocol}://${req.get('host')}/api/v1/jobseeker/confirm-mail/${confirmationToken}`;
    
    // HTML message
    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">
                <img src="" alt="Lysterpro Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h2 style="color: #333;">Welcome To The Lysterpro Community!</h2>
            <p>Hi ${req.body.firstName},</p>
            <p>Thank you for signing up with Lysterpro. Please confirm your email address by clicking the button below. This link will expire in 5 minutes.</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${confirmationLink}" style="background-color: #0A65CC; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
            </div>
            <p>If the button above does not work, copy and paste the following link into your web browser:</p>
            <p><a href="${confirmationLink}">${confirmationLink}</a></p>
            <p>Thank you,<br>The Lysterpro Team</p>
        </div>
    </div>
    `;

    await sendMail({
        email: req.body.email,
        subject: 'Confirm Your Email Address',
        message,
    });

    createSendToken(newJobSeeker, 201, res, {
        status: 'success',
        message: 'Confirmation email has been sent. Please check your email to confirm your address.'
    });
});

// mail confirmation logic
exports.confirmMail = catchAsync(async (req, res, next) => {
    const token = req.params.token;

    const jobseeker = await JobSeeker.findOneAndUpdate(
        { confirmationToken: token },
        { $set: { emailVerifiedAt: new Date(), emailVerify: true }, $unset: { confirmationToken: 1, confirmationTokenExpiration: 1 } },
        { new: true }
    );

    if (!jobseeker) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid token or token expired.'
        });
    }

    const currentTimestamp = Date.now();
    if (currentTimestamp > jobseeker.confirmationTokenExpiration) {
        return res.status(400).json({
            status: 'fail',
            message: 'Token has expired. Please request a new one.'
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Email confirmed successfully. Welcome to the Lysterpro Community! Now proceed to Login, complete your profile and get hired!',
    });

    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">
                <img src="" alt="Lysterpro Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h2 style="color: #333;">Welcome To The Lysterpro Community!</h2>
            <p>Hi ${jobseeker.firstName},</p>
            <p>Thank you for verifying your email address. Welcome to the Lysterpro Community! Now you can proceed to login, complete your profile, and get hired!</p>
            <p>Thank you,<br>The Lysterpro Team</p>
        </div>
    </div>
  `;

  await sendMail({
      email: jobseeker.email,
      subject: 'Welcome To The Lysterpro Community!',
      message,
  });
});

// JobSeeker signin logic
exports.jobSeekerSignin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const jobseeker = await JobSeeker.findOne({ email }).select('+password +isBanned +isSuspendedPermanently +suspendedUntil +active +emailVerify');

  if (!jobseeker || !(await jobseeker.correctPassword(password, jobseeker.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (jobseeker.isBanned === true || jobseeker.isSuspendedPermanently === true || (jobseeker.suspendedUntil && jobseeker.suspendedUntil > new Date())) {
    let errorMessage;
    if (jobseeker.isBanned) {
      errorMessage = 'You are banned from Lysterpro. Please contact Lysterpro administrator for further information or if you think this is a mistake.';
    } else {
      if (jobseeker.suspendedUntil) {
        const suspensionTimeLeft = jobseeker.suspendedUntil.getTime() - Date.now();
        const daysLeft = Math.ceil(suspensionTimeLeft / (1000 * 3600 * 24)); 
        errorMessage = `You are temporarily suspended for ${daysLeft} days. Please contact Lysterpro administrator for further information or if you think this is a mistake.`;
      } else {
        errorMessage = 'You are suspended permanently from Lysterpro. Please contact Lysterpro administrator for further information or if you think this is a mistake.';
      }
    }
    return next(new AppError(errorMessage, 403));
  }

  if (jobseeker.active === false) {
    return next(
      new AppError(
        'This account does not exist. Please contact the administrator if you think this is a mistake.',
        403
      )
    );
  };

  const message = jobseeker.emailVerify ? `Welcome back ${jobseeker.firstName} ${jobseeker.lastName}` : `Welcome back ${jobseeker.firstName} ${jobseeker.lastName}! Please verify your email address to access all features.`;
  
  createSendToken(jobseeker, 200, res, {
    status: 'success',
    message
  });
})

// jobseeker logout
exports.jobSeekerLogout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
      status: 'success',
      message: `Logged out! Bye for now.`,
  })
};

// jobSeeker protect middleware
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

  currentUser = await JobSeeker.findById(decoded.id);

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

// jobseeker isLoggedIn middleware
exports.isLoggedIn = async (req, res, next) => {
  req.locals = req.locals || {};

  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await JobSeeker.findById(decoded.id);

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

// jobseeker restrict to middleware
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

// jobseeker forgot password logic
exports.jobSeekerForgotPassword = catchAsync(async (req, res, next) => {
  const jobseeker = await JobSeeker.findOne({ email: req.body.email });
  if (!jobseeker) {
    return next(new AppError('Enter a valid Email address', 404));
  }

  const resetToken = jobseeker.createPasswordResetToken();
  await jobseeker.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/jobseeker/reset-password/${resetToken}`;

  const message = `
   <div style="font-family: Arial, sans-serif; line-height: 1.6;">
     <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
       <div style="text-align: center;">
         <img src="" alt="Lysterpro Logo" style="max-width: 200px; margin-bottom: 20px;">
       </div>
       <h2 style="color: #333;">Forgot Your Password?</h2>
       <p>Hi ${jobseeker.firstName},</p>
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
      email: jobseeker.email,
      subject: 'Your password reset token (Valid for only 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    jobseeker.passwordResetToken = undefined;
    jobseeker.passwordResetExpired = undefined;
    await jobseeker.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email, try again later.'),
      500
    );
  }
});

// jobseeker reset Password logic
exports.jobSeekerResetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const jobseeker = await JobSeeker.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!jobseeker) {
    return next(new AppError('Token is Invalid or has expired'), 400);
  }

  jobseeker.password = req.body.password;
  jobseeker.passwordConfirm = req.body.passwordConfirm;
  jobseeker.passwordResetToken = undefined;
  jobseeker.passwordResetExpires = undefined;
  await jobseeker.save();

  createSendToken(jobseeker, 200, res);
});

// jobseeker update password logic
exports.jobSeekerUpdatePassword = catchAsync(async (req, res, next) => {
  const jobseeker = await JobSeeker.findById(req.user.id).select('+password');

  if (!(await jobseeker.correctPassword(req.body.passwordCurrent, jobseeker.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  jobseeker.password = req.body.password;
  jobseeker.passwordConfirm = req.body.passwordConfirm;
  await jobseeker.save();

  createSendToken(jobseeker, 200, res);
});
