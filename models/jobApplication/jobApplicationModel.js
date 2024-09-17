const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobListing',
        required: [true, 'An application must belong to a job listing']
    },
    jobSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
        required: [true, 'An application must belong to a jobseeker']
    },
    resume: {
        type: String,
        required: [true, 'Your resume is required']
    },
    appliedOn: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;