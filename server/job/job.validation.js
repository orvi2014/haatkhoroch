const Joi = require('joi');

const idSchema = {
    id: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
  };

const schema = {
    title: Joi.string().min(2).max(32).trim(),
    vacancy: Joi.number().min(1),
    category: Joi.array().items(idSchema.id),
    duration: Joi.string(),
    gender: Joi.string(),
    responsibilities: Joi.string().min(5).max(250).trim(),
    educationLevel: Joi.string(),
    salaryMinimum: Joi.number().min(100),
    salaryMaximum: Joi.number().min(100),
    salaryMonthly: Joi.number().min(100),
    benefits: Joi.string().min(2).max(250),
    jobProviderName: Joi.string().trim().min(2).max(32),
    jobProviderContact: Joi.string(),
    jobProviderAddress: Joi.string().min(2).max(100).trim(),
    job:idSchema.id,
    isApplied: Joi.boolean(),
};

exports.jobValidation = data =>
Joi.object({
    title: schema.title.required(),
    vacancy: schema.vacancy.required(),
    category: schema.category.required(),
    duration:schema.duration.required(),
    gender: schema.gender.required(),
    responsibilities: schema.responsibilities.required(),
    educationLevel: schema.educationLevel.required(),
    salaryMinimum: schema.salaryMinimum,
    salaryMaximum: schema.salaryMaximum,
    salaryMonthly: schema.salaryMonthly.required(),
    benefits: schema.benefits.required(),
    jobProviderName: schema.jobProviderName.required(),
    jobProviderContact: schema.jobProviderContact.required(),
    jobProviderAddress: schema.jobProviderAddress.required(),
}).validate(data);  

exports.applyJobValidation = data => 
Joi.object({
    job: schema.job.required(),
    isApplied: schema.isApplied.required(), 
}).validate(data);

exports.appliedJobValidation = data => 
Joi.object({
    job: schema.job.required(),
}).validate(data);