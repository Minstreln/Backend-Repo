// Schedule an interview for an application
const scheduleInterview = catchAsync(async (req, res, next) => {
    const { date, time, location, virtualLink } = req.body;
    const { id } = req.params;
  
    // Validate if the application exists
    const application = await Application.findById(id);
  
    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }
  
    // Update interview details
    application.interview = {
      scheduled: true,
      date,
      time,
      location,
      virtualLink
    };
  
    await application.save();
  
    // Send email to job seeker about the interview
    await sendMail({
      to: application.jobSeeker.email,
      subject: 'Interview Scheduled',
      text: `Dear ${application.jobSeeker.firstName} ${application.jobSeeker.lastName},\n\nYou have been scheduled for an interview on ${date} at ${time}.\n\nLocation: ${location || 'Virtual'}\nVirtual Link: ${virtualLink || 'N/A'}\n\nBest regards`
    });
  
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
  };
  