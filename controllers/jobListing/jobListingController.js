const JobListing = require('../../models/jobListing/jobListingModel');
const catchAsync = require('../../utils/catchAsync');
const cron = require('node-cron');
const AppError = require('../../utils/appError');
const factory = require('../handler/handlerFactory');

// add Job Listing logic
exports.addJobListing = catchAsync(async (req, res) => {
    const recruiterId = req.user.id;
  
    const newJobListing = await JobListing.create({
        position: req.body.position,
        category: req.body.category,
        hiringCompany: req.body.hiringCompany,
        employmentType: req.body.employmentType,
        location: req.body.location,
        maxSalary: req.body.maxSalary,
        minSalary: req.body.minSalary,
        salaryType: req.body.salaryType,
        city: req.body.city,
        tags: req.body.tags,
        jobSetup: req.body.jobSetup,
        expirationDate: req.body.expirationDate,
        jobDescription: req.body.jobDescription,
        responsibility: req.body.responsibility,
        requirements: req.body.requirements,
        skillsAndQualifications: req.body.skillsAndQualifications,
        yearsOfExperience: req.body.yearsOfExperience,
        positionLevel: req.body.positionLevel,
        recruiter: recruiterId
    });

    res.status(201).json({
        status: 'success',
        message: 'Job has been listed successfully',
        data: {
            newJobListing,
        },
    });
});

// crud operations for Job Listing
exports.getAllJobListing = factory.getAll(JobListing);

exports.getJobListing = factory.getOne(JobListing);

exports.updateJobListing = factory.updateOne(JobListing);

exports.deleteJobListing = factory.deleteOne(JobListing);

exports.getJobsByCategory = catchAsync(async (req, res) => {
    const categoryId = req.params.categoryId;

    const jobs = await JobListing.find({ category: categoryId }).populate('category');

    if (!jobs.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'No jobs found for this category',
        });
    }

    res.status(200).json({
        status: 'success',
        results: jobs.length,
        data: {
            jobs,
        },
    });
});

// deactivate joblisting by recruiter
exports.deactivateJobListing = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;

    const job = await JobListing.findByIdAndUpdate(jobId, 
    { 
        isDeactivated: true, status: 'closed'
    }, { new: true });

    if (!job) {
        return next(new AppError('Job listing not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            job,
        },
    });
});

// update job listing status
exports.updateJobStatus = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;
    const { status } = req.body;

    const job = await JobListing.findByIdAndUpdate(jobId, { status }, { new: true });

    if (!job) {
        return next(new AppError('Job not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            job,
        },
    });
});

// get job listings that belong to a recruiter
exports.getRecruiterJobListings = catchAsync(async (req, res, next) => {
    const recruiterId = req.user.id;

    const recruiterJobs = await JobListing.find({ recruiterId: recruiterId });

    if (!recruiterJobs.length) {
        return next(new AppError('No job listings found for you', 404));
    }

    res.status(200).json({
        status: 'success',
        results: recruiterJobs.length,
        data: {
            jobs: recruiterJobs
        }
    });
});


///////////////////////////////// CRON JOB /////////////////////////////////////////

// Function to update job statuses for expired jobs
const updateExpiredJobs = async () => {
    // console.log(`Running update job expiration task at ${new Date().toLocaleTimeString()}...`);

    try {
        const now = new Date();

        const expiredJobs = await JobListing.find({
            expirationDate: { $lte: now },
            status: 'open'
        });

        let modifiedCount = 0;

        for (let job of expiredJobs) {
            job.status = 'closed';
            await job.save();
            modifiedCount++;
        }

        // console.log(`Expired ${modifiedCount} jobs at ${new Date().toLocaleTimeString()}.`);
    } catch (error) {
        console.error('Error updating expired jobs:', error);
    }
};

const updateExpiredJobsTask = cron.schedule('* * * * *', updateExpiredJobs);

updateExpiredJobsTask.start();
