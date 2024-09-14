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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
    }
});

const CompanyDetail =  mongoose.model('CompanyDetail', companyDetailSchema);

module.exports = CompanyDetail;
