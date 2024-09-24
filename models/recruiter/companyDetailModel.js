const mongoose = require('mongoose');

const companyDetailSchema = mongoose.Schema({
    companyName: {
        type: String,
        trim: true,
        maxLength: [100, 'Can not be more than 100 characters!']
    },
    location: {
        type: String,
        required: [true, 'please enter your location'],
        maxLength: [100, 'Maximum of 100 words!'],
    },
    aboutUs: {
        type: String,
        required: [true, 'Please tell us about your company'],
    },
    yearOfJoining: {
        type: Number,
        required: [true, 'Year of joining is required'],
    },
    employmentProof: {
        type: String,
        required: [true, 'Your employment proof is required']
    },
    companyType: {
        type: String,
        required: [true, 'Company type is required'],
    },
    companyWebsite: {
        type: String,
    },
    companyLogo: {
        type: String,
        required: [true, 'Please upload your company logo'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
    }
});

const CompanyDetail =  mongoose.model('CompanyDetail', companyDetailSchema);

module.exports = CompanyDetail;
