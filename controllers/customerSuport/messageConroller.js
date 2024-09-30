const Message = require('../../models/messageModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Ticket = require('../../models/ticketModel'); 
// const Recruiter = require('../../models/recruiterModel'); 

// Create a new message
exports.createMessage = catchAsync(async (req, res, next) => {
  const { ticket, sender, content } = req.body;

  // Validate ticket and sender exist
  const ticketExists = await Ticket.findById(ticket);
  const senderExists = await Recruiter.findById(sender);

  if (!ticketExists) {
    return next(new AppError('Ticket not found', 404));
  }

  if (!senderExists) {
    return next(new AppError('Sender not found', 404));
  }

  const message = await Message.create({ ticket, sender, content });

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
