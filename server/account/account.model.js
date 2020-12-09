const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

// defining all the fields of individual account
const accountsSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    hash: String,
    salt: String,
    password: {
      type: String,
      required: true,
    },

    contactNo: {
      type: String,
      required: false,
      unique: true,
    },
    gender: {
      type: String,
      description: 'can be male,female & others',
      enum: ['male', 'female', 'others'],
    },
    // it must be empty
    // if null, it will create an duplicateError
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'O+', 'O-', 'AB+', 'AB-', 'B+', 'B-'],
    },
    transaction: {
      type: String,
      required: true,
      trim: true,
    },
    currentOccuption: {
      type: String,
      trim: true,
    },
    nidBirthCertificate: {
      type: String,
      trim: true,
    },
    nameSchool: {
      type: String,
      trim: true,
    },
    schoolPassing: {
      type: String,
      trim: true,
    },
    schoolCgpa: {
      type: String,
      trim: true,
    },
    nameCollege: {
      type: String,
      trim: true,
    },
    collegePassing: {
      type: String,
      trim: true,
    },
    collegeCgpa: {
      type: String,
      trim: true,
    },
    nameUniversty: {
      type: String,
      trim: true,
    },
    universityPassing: {
      type: String,
      trim: true,
    },
    universityCgpa: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    flatNo: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      trim: true,
    },
    presentThana: {
      type: String,
      trim: true,
    },
    district:{
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    postOffice: {
      type: String,
      trim: true,
    },
    permanentThana:{
      type: String,
      trim: true,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    skill: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    }],
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
accountsSchema.pre('save', function (next) {
  const account = this;

  // only hash the password if it has been modified (or is new)
  if (!account.isModified('password')) {
    return next();
  }

  // generate a salt
  // promise function ES6 style
  return new Promise((resolve, reject) =>
    // Generate hash's random salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) {
        return reject(err);
      }

      // Now, with the given salt, generate the hash
      bcrypt.hash(account.password, salt, (err, hash) => {
        if (err) {
          return reject(err);
        }
        // Hash generated successfully!
        account.password = hash;
        return resolve(hash);
      });
    }),
  );
});

// TODOS: Convert into promise based function
accountsSchema.methods.comparePassword = function (
  candidatePassword,
  cb,
) {
  // es5 style
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Account', accountsSchema);
