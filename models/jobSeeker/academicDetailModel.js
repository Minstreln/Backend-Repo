const mongoose = require('mongoose');

const academicDetailSchema = mongoose.Schema({
    institutionName: {
        type: String,
        trim: true,
        maxLength: [100, 'Can not be more than 100 characters!']
    },
    location: {
        type: String,
        required: [true, 'please enter your location'],
        maxLength: [100, 'Maximum of 100 words!'],
    },
    yearOfCompletion: {
        type: Number,
        required: [true, 'Year of completion is required'],
    },
    certificate: {
        type: String,
        required: [true, 'Your degree certificate is required']
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
    }
});

const AcademicDetail =  mongoose.model('AcademicDetail', academicDetailSchema);

module.exports = AcademicDetail;
