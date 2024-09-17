const mongoose = require('mongoose');

const joblistingSchema = new mongoose.Schema({
    position: {
        type: String,
        required: [true, 'Please enter the position you are hiring for'],
        maxLength: [100, 'cannot be more than 100 characters'],
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please select a category'],
    },
    hiringCompany: {
        type: String,
        required: [true, 'Please enter the name of the company hiring for this role'],
        maxLength: [255, 'cannot exceed 255 characters'],
        trim: true,
    },
    employmentType: {
        type: String,
        required: [true, 'Please enter the employment type for this role'],
        maxLength: [255, 'cannot exceed 255 characters'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please enter the country the company is located at'],
        maxLength: [255, 'cannot exceed 255 characters'],
        trim: true,
    },
    salary: {
        type: String,
        required: [true, 'Please enter the salary for this role'],
        maxLength: [255, 'cannot exceed 255 characters'],
    },
    jobSetup: {
        type: String,
        required: [true, 'Please enter the setup for this role'],
    },
    jobDescription: {
        type: String,
        required: [true, 'Please enter the description for this role'],
    },
    responsibility: {
        type: String,
        required: [true, 'Please enter the responsibility for this role'],
    },
    requirements: {
        type: String,
        required: [true, 'Please enter the requirements for this role'],
    },
    positionLevel: {
        type: String,
        required: [true, 'Please enter the position level for this role'],
    },
    skillsAndQualifications: {
        type: String,
        required: [true, 'Please enter the skills and qualifications for this role']
    },
    yearsOfExperience: {
        type: Number,
        required: [true, 'Please specify the minimum years of experience required'],
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: [true, 'Could not create job listing at this time']
    }
    }, {
    timestamps: true, 
});

const JobListing = mongoose.model('JobListing', joblistingSchema);

module.exports = JobListing;