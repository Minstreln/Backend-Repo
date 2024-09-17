const mongoose = require('mongoose');

const personalDetailSchema = mongoose.Schema({
    middleName: {
        type: String,
        trim: true,
        maxLength: [100, 'Your middle name can not be more than 100 characters!']
    },
    location: {
        type: String,
        required: [true, 'please enter your location'],
        maxLength: [100, 'Maximum of 100 words!'],
    },
    profileImage: {
        type: String,
        required: [true, 'please upload a profile picture'],
    },
    linkedAccount: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
    }
});

const RecruiterPersonalDetail =  mongoose.model('RecruiterPersonalDetail', personalDetailSchema);

module.exports = RecruiterPersonalDetail;
