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
    aboutMe: {
        type: String,
        required: [true, 'please tell us more about you'],
        maxLength: [1000, 'you can have at most 1000 words'],
        minLength: [300, 'you can have a minimum of 300 words']
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
        ref: 'JobSeeker',
    }
});

const PersonalDetail =  mongoose.model('PersonalDetail', personalDetailSchema);

module.exports = PersonalDetail;
