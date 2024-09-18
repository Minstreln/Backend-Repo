const catchAsync = require('../../utils/catchAsync');
const Application = require('../../models/applicationManagements/applicationManagementModels');
const AppError = require('../../utils/appError');
const sendMail = require('../../utils/email');
const { body, validationResult } = require('express-validator');

// Middleware for validating input
const validateInterview = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('time').isString().withMessage('Invalid time format'),
  body('location').optional().isString().withMessage('Invalid location format'),
  body('virtualLink').optional().isString().withMessage('Invalid virtual link format'),
];

// Schedule an interview for an application
const scheduleInterview = catchAsync(async (req, res, next) => {
    const { date, time, location, virtualLink } = req.body;
    const { id } = req.params;

    const application = await Application.findById(id).populate('applicant');

    if (!application) {
        return next(new AppError('No application found with that ID', 404));
    }

    // Ensure the applicant data is complete
    const applicant = application.applicant;
    if (!applicant || !applicant.email || !applicant.firstName || !applicant.lastName) {
        return next(new AppError('Job seeker data is incomplete', 400));
    }

    application.interview = {
        scheduled: true,
        date,
        time,
        location,
        virtualLink
    };

    await application.save();

    try {
        await sendMail({
            to: applicant.email,
            subject: 'Interview Scheduled',
            text: `Dear ${applicant.firstName} ${applicant.lastName},\n\nYou have been scheduled for an interview on ${date} at ${time}.\n\nLocation: ${location || 'Virtual'}\nVirtual Link: ${virtualLink || 'N/A'}\n\nBest regards`,
            html: `<p>Dear ${applicant.firstName} ${applicant.lastName},</p>
                   <p>You have been scheduled for an interview on ${date} at ${time}.</p>
                   <p>Location: ${location || 'Virtual'}</p>
                   <p>Virtual Link: ${virtualLink || 'N/A'}</p>
                   <p>Best regards</p>`,
        });
    } catch (emailError) {
        console.error(`Failed to send email: ${emailError.message}`);
        return next(new AppError('Failed to send email to job seeker', 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'Interview scheduled successfully',
        data: {
            application
        }
    });
});

module.exports = {
    scheduleInterview,
    validateInterview,
};
