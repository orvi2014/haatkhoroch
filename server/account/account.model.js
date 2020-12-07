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
    coverImage: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    position: {
      type: String,
      trim: true,
      max: 32,
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
      required: true,
    },
    hash: String,
    salt: String,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['guest', 'admin', 'company', 'user'],
      default: 'user',
    },
    accountType: {
      type: String,
      enum: ['premium', 'normal'],
      default: 'normal',
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
    secondaryEmail: {
      type: String,
      lowercase: true,
      unique: false,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'O+', 'O-', 'AB+', 'AB-', 'B+', 'B-'],
    },
    location: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      max: 250,
      trim: true,
    },
    skillArea: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillArea',
      },
    ],
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    jobExperience: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobexperience',
      },
    ],
    education: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Education',
      },
    ],
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
accountsSchema.index(
  { email: 1, secondaryEmail: 1 },
  { unique: true },
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
  // promise based
  // return new Promise((resolve, reject) =>
  //   bcrypt.compare(
  //     candidatePassword,
  //     this.password,
  //     (err, isMatch) => {
  //       if (err) {
  //         return reject(err);
  //       }
  //       return isMatch ? resolve(isMatch) : reject();
  //     },
  //   ),
  // );
  // es5 style
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Account', accountsSchema);
