const jwt = require('jsonwebtoken');
const axios = require('axios');
const JobSeeker = require('../../../models/jobSeeker/jobSeekerAuthModel');
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

// GOOGLE AUTHENTICATION

// Initiates the Google sign-in flow
exports.jobseekerGoogleAuthInit = catchAsync(async (req, res, next) => {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.JOBSEEKER_CLIENT_ID}&redirect_uri=${process.env.JOBSEEKER_REDIRECT_URI}&response_type=code&scope=${scope}`;
    
    res.status(200).json({
      status: 'success',
      message: url,
    });
});
  
const generateTempPassword = () => {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let tempPassword = '';
    for (let i = 0; i < length; i++) {
      tempPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return tempPassword;
};
  
// Callback URL for handling the Google sign in response
exports.jobseekerGoogleAuthCallback = catchAsync(async (req, res, next) => {
    const { code } = req.query;

    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.JOBSEEKER_CLIENT_ID,
      client_secret: process.env.JOBSEEKER_CLIENT_SECRET,
      code,
      redirect_uri: process.env.JOBSEEKER_REDIRECT_URI,
      grant_type: 'authorization_code',
    });
  
    const { id_token } = data;
  
    const decodedToken = jwt.decode(id_token);

    const { email, given_name, family_name, email_verified } = decodedToken;
  
    const password = generateTempPassword();
  
    const existingJobseeker = await JobSeeker.findOne({ email });
    if (existingJobseeker) {
      createSendToken(existingJobseeker, 200, res, {
        status: 'success',
        message: 'Log in successful, welcome back!'
      });
    } else {
      const newJobseeker = await JobSeeker.create({
        firstName: given_name,
        lastName: family_name,
        email: email,
        terms: true,
        emailVerify: email_verified,
        password: password,
        passwordConfirm: password,
        createdAt: new Date(),
        emailVerifiedAt: email_verified ? new Date() : null,
      });

      createSendToken(newJobseeker, 201, res, {
        status: 'success',
        message: 'Sign in successful, Welcome to the Lysterpro community! Now proceed to complete your profile and get hired!'
      });
     }
});
  