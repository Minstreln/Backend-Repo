const express = require('express');
const morgan = require('morgan');
// const http = require('http');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const globalErrorHandler = require('./controllers/errorHandler/errorController');

// ---------------- route modules go here -------------------------------------

const jobSeekerRouter = require('./routes/jobSeeker/jobSeekerRoutes');
const recruiterRouter = require('./routes/recruiter/recruiterRoutes');
const adminRouter = require('./routes/admin/adminRoutes');

// ---------------------------------------------------------------------------

const app = express();

app.use(cors())

app.use(cookieParser());

app.use(express.static(`${__dirname}/public}`));

app.use(express.json());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

//-------------- Routes should go here ---------------------------

// jobseeker route
app.use('/api/v1/jobseeker', jobSeekerRouter);
// recruiter route
app.use('/api/v1/recruiter', recruiterRouter);
//admin routes
app.use('/api/v1/admin', adminRouter);

//----------------------------------------------------------------

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server 🚨!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;