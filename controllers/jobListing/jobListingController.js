const JobListing = require('../../models/jobListing/jobListingModel');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../handler/handlerFactory');

// add Job Listing logic
exports.addJobListing = catchAsync(async (req, res) => {
    const recruiterId = req.user._id;
    const newJobListing = await JobListing.create({
        position: req.body.position,
        category: req.body.category,
        hiringCompany: req.body.hiringCompany,
        employmentType: req.body.employmentType,
        location: req.body.location,
        salary: req.body.salary,
        jobSetup: req.body.jobSetup,
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
