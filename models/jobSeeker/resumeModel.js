const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A title is requireed!'],
    },
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
