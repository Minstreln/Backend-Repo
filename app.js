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
const categoryRouter = require('./routes/category/categoryRoutes');
const jobListingRouter = require('./routes/jobListing/jobListingRoutes');
const loginRouter = require('./routes/login/loginRoutes');

const applicationManagementRouter =  require('./routes/applications/applicationManagementRoutes');
const ticketRouter = require('./routes/customerSupport/ticketRoutes');
const messageRouter = require('./routes/customerSupport/messageRoute');
const inteviewSheduleRouter = require('./routes/applications/interviewScheduleRoute');
const applicationRouter = require('./routes/jobSeeker/applicationRoute');


// ---------------------------------------------------------------------------

const app = express();

app.use(cors())

app.use(cookieParser());

app.set('trust proxy', 1);

app.use(express.static(`${__dirname}/public}`));

app.use(express.json());

const limiter = rateLimit({
  max: 10000,
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
// admin routes
app.use('/api/v1/admin', adminRouter);
// category routes
app.use('/api/v1/category', categoryRouter);
// Job listing routes
app.use('/api/v1/jobListing', jobListingRouter);
// login route for both jobseeker and recruiter
app.use('/api/v1/auth', loginRouter);

app.use('/api/v1/applications-management', applicationManagementRouter);

app.use('/api/v1/applications', applicationRouter);

app.use('/api/v1/tickets', ticketRouter);

app.use('/api/v1/messages', messageRouter);

app.use('/api/v1/interview-schedule', inteviewSheduleRouter);

//----------------------------------------------------------------

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server 🚨!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
