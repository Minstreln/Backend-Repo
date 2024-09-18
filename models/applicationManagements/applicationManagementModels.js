const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobListing', 
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker', 
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'interviewed', 'accepted', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'interviewed', 'accepted', 'rejected'],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  interview: {
    scheduled: {
      type: Boolean,
      default: false,
    },
    date: Date,
    time: String,
    location: String,
    virtualLink: String,
  },
});


applicationSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});


applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, updatedAt: Date.now() });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
