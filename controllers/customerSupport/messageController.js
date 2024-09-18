const Message = require('../../models/customerSupport/messageModels');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Ticket = require('../../models/customerSupport/ticketModel')  
const JobSeeker = require('../../models/jobSeeker/jobSeekerAuthModel'); 
const sendMail = require('../../utils/email'); 

// Create a new message
exports.createMessage = catchAsync(async (req, res, next) => {
  const { ticket, content } = req.body;

  // Validate ticket exists
  const ticketExists = await Ticket.findById(ticket);

  if (!ticketExists) {
    return next(new AppError('Ticket not found', 404));
  }

  // Use logged-in recruiter's ID
  const sender = req.user._id;

  // Create the message
  const message = await Message.create({ ticket, sender, content });

  // Retrieve the job seeker associated with the ticket
  const jobSeeker = await JobSeeker.findById(ticketExists.user);

  if (jobSeeker) {
    // Send email notification
    await sendMail({
      to: jobSeeker.email,
      subject: 'New Message on Your Ticket',
      html: `<p>Dear ${jobSeeker.firstName},</p>
             <p>You have a new message on your ticket:</p>
             <p>${content}</p>
             <p>Best regards,</p>
             <p>Your Support Team</p>`
    });
  }

  // Send the response after sending the email
  res.status(201).json({
    status: 'success',
    data: {
      message
    }
  });
});

// Get all messages for a specific ticket
exports.getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ ticket: req.params.ticketId }).populate('sender');

  if (!messages || messages.length === 0) {
    return next(new AppError('No messages found for this ticket', 404));
  }

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages
    }
  });
});
