const jwt = require('jsonwebtoken');
const axios = require('axios');
const Recruter = require('../../../models/recruiter/recruiterAuthModel');
const catchAsync = require('../../../utils/catchAsync');

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

// FACEBOOK AUTHENTICATION

// Initiates the Facebook Login flow
exports.recruiterFbAuthInit = catchAsync( async(req, res, next) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${process.env.RECRUITER_APP_ID}&redirect_uri=${process.env.RECRUITER_FB_REDIRECT_URI}&scope=public_profile,email`;
  
    res.status(201).json({
      status: 'success',
      message: url,
    });
});
  
// Callback URL for handling the Facebook Login response
exports.recruiterFbAuthCallback = catchAsync( async (req, res, next) => {
    const { code } = req.query;

    const { data } = await axios.post('https://graph.facebook.com/v13.0/oauth/access_token', {
      client_id: process.env.RECRUITER_APP_ID,
      client_secret: process.env.RECRUITER_APP_SECRET,
      code,
      redirect_uri: process.env.RECRUITER_FB_REDIRECT_URI,
      grant_type: 'authorization_code',
    })
  
    const { access_token } = data;
  
    const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);
  
    const { email, name } = profile;

    const [firstName, lastName] = name.split(' ');
  
    const password = generateTempPassword();
  
    const existingRecruiter = await Recruter.findOne({ email });
    if (existingRecruiter) {
      createSendToken(existingRecruiter, 200, res, {
        status: 'success',
        message: 'Log in successful, welcome back!'
      });
    } else {
      const newRecruiter = await Recruter.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        terms: true,
        emailVerify: email_verified,
        password: password,
        passwordConfirm: password,
        createdAt: new Date(),
        emailVerifiedAt: email_verified ? new Date() : null, 
      });
  
      createSendToken(newRecruiter, 201, res, {
        status: 'success',
        message: 'Sign in successful, Welcome to the Lysterpro community! Now proceed to complete your profile and hire your first resource!'
      });
     }
});
  