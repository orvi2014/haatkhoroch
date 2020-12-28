const {Job, JobAccount} = require('./job.model');
const { jobValidation, applyJobValidation, appliedJobValidation } = require('./job.validation');
const logger = require('../../config/winston');
const {
    sendJSONresponse,
    sendErrorResponse,
  } = require('../helpers/jsonResponse');

const createJob = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return sendErrorResponse(res, 406, 'contentTypeError', { reason: `Expects 'application/json'`});
          };
          const data = req.body;
          const { error } = jobValidation(data);
          if (error){
              return sendErrorResponse(res, 400, 'validationError',{
                   missingField: error.details[0].path,
                   message: error.details[0].message.replace(/['"]/g, ''),
              });
          };
        const newJob = new Job({
         title: data.title,
         vacancy: data.vacancy,
         category: data.category,
         duration: data.duration,
         gender: data.gender,
         responsibilities: data.responsibilities,
         educationLevel: data.educationLevel,
         salaryMinimum: data.salaryMinimum,
         salaryMaximum: data.salaryMaximum,
         salaryMonthly: data.salaryMonthly,
         benefits: data.benefits,
         jobProviderName: data.jobProviderName,
         jobProviderContact: data.jobProviderContact,
         jobProviderAddress: data.jobProviderAddress,
        });
        await newJob.save();
        return sendJSONresponse(res, 201, newJob);
    }
    catch (error){
        logger.error(`Job: ${error}`);
        next(error);
    }
};

const jobListView = async (req, res, next) =>{
    try {
        const jobList = await Job.find({isApproved: true}).populate('category', '_id');
        return sendJSONresponse(res, 200, jobList);
    } catch (err) {
        logger.error(`Job: ${err}`);
        next(err);
    }
};

const applyJob = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return sendErrorResponse(res, 406, 'contentTypeError', { reason: `Expects 'application/json'`});
          };
          const data = req.body;
          const { error } = applyJobValidation(data);
          if (error){
              return sendErrorResponse(res, 400, 'validationError',{
                   missingField: error.details[0].path,
                   message: error.details[0].message.replace(/['"]/g, ''),
              });
          };
        const applyJob =await JobAccount.create({
                job: data.job,
                account: req.user._id,
                isApplied: data.isApplied,
            
        });
        await applyJob.save();
        return sendJSONresponse(res, 200, applyJob);
    } catch (err) {
        logger.error(`Job: ${err}`);
        next(err);
    }
};

const appliedJob = async (req, res, next) => {
    try {
        const numApplied = await JobAccount.countDocuments({
            account: req.user._id,
            isApplied: true,
        });
        return sendJSONresponse( res, 200, {numApplied});
    } catch (err) {
        logger.error(`Job: ${err}`);
        next(err);
    }
};
const appliedJobAccount = async (req,res,next) => {
    try {
        if (!req.is('application/json')) {
            return sendErrorResponse(res, 406, 'contentTypeError', { reason: `Expects 'application/json'`});
          };
          const data = req.body;
          const { error } = appliedJobValidation(data);
          if (error){
              return sendErrorResponse(res, 400, 'validationError',{
                   missingField: error.details[0].path,
                   message: error.details[0].message.replace(/['"]/g, ''),
              });
          };
        const job = await JobAccount.findOne({
            job: data.job,
            account: req.user._id,
        });
        return sendJSONresponse(res, 200, job.isApplied);
    } catch (err) {
        logger.error(`Job: ${err}`);
        next(err);
    }
}
const completeJob = async (req, res, next) => {
    try {
        const numCompleted = await JobAccount.countDocuments({
            account: req.user._id,
            isApplied: true,
            isComplete: true
        });
        return sendJSONresponse( res, 200, {numCompleted});
    } catch (err) {
        logger.error(`Job: ${err}`);
        next(err);
    }
}

module.exports = {
    createJob,
    jobListView,
    applyJob,
    appliedJob,
    completeJob,
    appliedJobAccount
}