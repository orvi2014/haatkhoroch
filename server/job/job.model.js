const mongoose = require('mongoose');

// defining all the fields of individual account
const jobSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        trim: true,
        required: true,
    },
    vacancy: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    duration:{
        type: String,
        required: true,
    },
    gender: {
        type: String,
        trim: true,
        required: true, 
    },
    responsibilities: {
        type: String,
        trim: true,
    },
    educationLevel: {
        type: String,
        trim: true,
        required: true, 
    },
    salaryMinimum: {
        type: Number,
    },
    salaryMaximum: {
        type: Number,
    },
    salaryMonthly: {
        type: Number,
        required: true, 
    },
    benefits:{
        type: String,
        trim: true,
        required: true, 
    },
    jobProviderName: {
        type: String,
        trim: true,
        required: true, 
    },
    jobProviderContact:{
        type: String,
        trim: true,
        required: true, 
    },
    jobProviderAddress: {
      type: String,
      trim: true,
      required: true,  
    },
    isApproved: {
        type: Boolean,
        default: false,
    }, 
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const jobAccountSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    isApplied: {
        type: Boolean,
        default: false,
    },
    version: {
        type: Number,
        default: 0,
      },
 
},{
    timestamps: true,
  },)

let JobAccount = mongoose.model(`JobAccount`, jobAccountSchema); 
let Job = mongoose.model('Job', jobSchema)
module.exports = {
    Job,
    JobAccount
};
