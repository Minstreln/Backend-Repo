const mongoose = require('mongoose');

const experienceSchema = mongoose.Schema({
    role: {
        type: String,
        trim: true,
        maxLength: [100, 'Can not be more than 100 characters!']
    },
    typeOfRole: {
        type: String,
        trim: true,
        maxLength: [100, 'Can not be more than 100 characters!']
    },
    company: {
        type: String,
        required: [true, 'please enter the company you worked for'],
        maxLength: [100, 'Maximum of 100 words!'],
    },
    typeOfOrg: {
        type: String,
        required: [true, 'The type of organization is required'],
    },
    location: {
        type: String,
        required: [true, 'please enter your location'],
        maxLength: [100, 'Maximum of 100 words!'],
    },
    startDate: {
        type: Date,
        required: [true, 'Please enter a valid start date'],
    },
    endDate: {
        type: Date,
        required: [true, 'Please enter a valid end date'],
    },
    currentWorkPlace: {
        type: Boolean,
        requried: [true, 'Current work place is required'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
    }
});

const Experience =  mongoose.model('Experience', experienceSchema);

module.exports = Experience;
