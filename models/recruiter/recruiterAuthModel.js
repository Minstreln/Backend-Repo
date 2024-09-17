const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const recruiterSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'please enter your first name'],
        trim: true,
        maxLength: [100, 'Your first name can not be more than 100 characters!']
    },
    lastName: {
        type: String,
        required: [true, 'please enter your last name'],
        trim: true,
        maxLength: [100, 'Your last name can not be more than 100 characters!']
    },
    email: {
        type: String,
        required: [true, 'Enter your email address'],
        unique: [true, 'This email address already exists on our server!'],
        lowercase: true,
        validate: [validator.isEmail, 'Enter a valid Email address!'],
        index: true,
    },
    terms:{
        type: Boolean,
        required: [true, 'Please agree to the terms and conditions']
    },
    phoneNumber: {
        type: String,
    },
    role: {
        type: String,
        default: 'recruiter',
    },
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        trim: true,
        minlength: [6, 'Your password cannot be less than 6 digits!'],
        maxlength: [6, 'Your password can not be greater than 6 digits!'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        trim: true,
        minlength: [6, 'Your password cannot be less than 6 digits!'],
        maxlength: [6, 'Your password can not be greater than 6 digits!'],
        validate: {
            validator: function (el) {
            return el === this.password;
            },
            message: 'Password do not match',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
        select: false,
    },
    isFlagged: {
        type: Boolean,
        default: false,
    },
    flagReason: [
        {
            type: String,
            required: [true, 'Please provide a reason for reporting this Account']
        }
    ],
    isSuspendedPermanently: {
        type: Boolean,
        default: false,
        select: false,
        index: true,
    },
    suspendedUntil: {
        type: Date,
        default: null,
        index: true,
    },
    phoneVerify: {
        type: Boolean,
        default: false,
        select: false,
    },
    otp: {
        type: String,
        index: true,
    },
    otpExpiration: {
        type: Date,
        index: true,
    },
    confirmationToken: {
        type: String,
        index: true,
    },
    confirmationTokenExpiration: {
        type: Date,
        index: true,
    },
    emailVerify: {
        type: Boolean,
        default: false,
        select: false,
    },
    createdAt: {
        type: Date
    },
    emailVerifiedAt: {
        type: Date
    },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

recruiterSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
  });

recruiterSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hashSync(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

recruiterSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

recruiterSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

recruiterSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
    );
    return JWTTimestamp < changedTimestamp;
    }
    return false;
};

recruiterSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 1 * 60 * 1000;

    return resetToken;
};

const Recruiter =  mongoose.model('Recruiter', recruiterSchema);

module.exports = Recruiter;
