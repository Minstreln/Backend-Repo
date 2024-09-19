const Ticket = require('../../models/customerSupport/ticketModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Create a new ticket
exports.createTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.create({ ...req.body, user: req.user.id });

  res.status(201).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// Get all tickets for the logged-in user
exports.getUserTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

// Get a specific ticket by ID
exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Ensure the logged-in user owns the ticket
  if (ticket.user.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to access this ticket', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// Update ticket (subject or description)
exports.updateTicket = catchAsync(async (req, res, next) => {
  const { subject, description } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Ensure the logged-in user owns the ticket
  if (ticket.user.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to edit this ticket', 403));
  }

  // Update only subject and description
  if (subject) ticket.subject = subject;
  if (description) ticket.description = description;
  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// Delete a ticket
exports.deleteTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Ensure the logged-in user owns the ticket
  if (ticket.user.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to delete this ticket', 403));
  }

  await ticket.remove();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Admin or support staff can update ticket status
exports.updateTicketStatus = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  console.log(ticket);
  console.log(ticket.user)

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }


  if (!req.body.status) {
    return next(new AppError('Status is required to update the ticket', 400));
  }

  ticket.status = req.body.status;
  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});
