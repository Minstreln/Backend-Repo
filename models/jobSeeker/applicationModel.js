const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    jobListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobListing',
        required: [true, 'Job listing reference is required'],
    },
    jobSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
        required: [true, 'Job seeker reference is required'],
    },
    experience: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experience',
    }],
    personalDetails: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalDetail',
    }],
    coverLetter: {
        type: String,
        required: [true, 'Cover letter is required'],
        maxLength: [1000, 'Cover letter cannot exceed 1000 characters']
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
    },
    status: {
        type: String,
        enum: ['Applied', 'Reviewed', 'Interviewed', 'Hired', 'Rejected'],
        default: 'Applied',
    },
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
    statusHistory: [
        {
            status: {
                type: String,
                enum: ['Applied', 'Reviewed', 'Interviewed', 'Hired', 'Rejected'],
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true, 
});

const JobApplication = mongoose.model('Application', JobApplicationSchema);

module.exports = JobApplication;
