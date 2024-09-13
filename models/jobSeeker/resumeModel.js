const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema({
    resume: {
        type: String,
        required: [true, 'Your resume is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
    }
});

const Resume =  mongoose.model('Resume', resumeSchema);

module.exports = Resume;
