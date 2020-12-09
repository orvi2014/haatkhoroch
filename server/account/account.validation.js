// Reference: https://docs.google.com/document/d/1yGg5DUbqOrw1aCA5u1s2VCRL_dFu6LQOvbDLamgl9bM/edit#
const Joi = require('joi');

const idSchema = {
  id: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
};

const schema = {
  fullName: Joi.string().trim().lowercase().min(2).max(32),
  email: Joi.string()
    .regex(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
    .lowercase()
    .min(3)
    .max(62),
  password: Joi.string()
    .regex(
      /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/,
    )
    .required(),
  birthDate: Joi.date(),
  contactNo: Joi.string(),
  bloodGroup: Joi.string().valid([
    'A+',
    'A-',
    'O+',
    'O-',
    'AB+',
    'AB-',
    'B+',
    'B-',
  ]),
  gender: Joi.string().valid(['male', 'female', 'others']),
  transaction: Joi.string(),
  currentOccuption: Joi.string(),
  nidBirthCertificate:Joi.string(),
  nameSchool:Joi.string(),
  schoolPassing:Joi.string(),
  schoolCgpa:Joi.string(),
  nameCollege:Joi.string(),
  collegePassing: Joi.string(),
  collegeCgpa: Joi.string(),
  nameUniversity: Joi.string(),
  universityPassing: Joi.string(),
  universityCgpa: Joi.string(),
  studentId: Joi.string(),
  flatNo:Joi.string(),
  street: Joi.string(),
  presentThana: Joi.string(),
  district: Joi.string(),
  village: Joi.string(),
  postOffice: Joi.string(),
  permanentThana: Joi.string(),
  skill: Joi.array().items(idSchema.id),
  profileImage: Joi.string(),
};

// module.exports = {
//   register: Joi.object().keys({
//     // body: Joi.object().keys({

//     // }),
//   }),
//   login: Joi.object().keys({
//     body: Joi.object().keys({
//       email: schema.email.required(),
//       password: schema.password.required(),
//     }),
//   }),
//   update: Joi.object().keys({
//     body: Joi.object().keys({
//       birthDate: schema.birthDate.required(),
//       bloodGroup: schema.bloodGroup.required(),
//       gender: schema.gender.required(),
//       profileImage: schema.profileImage.required(),
//       transaction: schema.transaction.required(),
//       currentOccuption: schema.currentOccuption.required(),
//       nidBirthCertificate: schema.nidBirthCertificate.required(),
//       nameSchool: schema.nameSchool.required(),
//       schoolPassing: schema.schoolPassing.required(),
//       schoolCgpa: schema.schoolCgpa,
//       nameCollege: schema.nameCollege,
//       collegePassing: schema.collegePassing,
//       collegeCgpa: schema.collegeCgpa,
//       nameUniversity: schema.nameUniversity,
//       universityPassing: schema.universityPassing,
//       universityCgpa: schema.universityCgpa,
//       studentId: schema.studentId,
//       flatNo: schema.flatNo,
//       street: schema.street,
//       presentThana: schema.presentThana,
//       district: schema.district,
//       village: schema.village,
//       postOffice: schema.postOffice,
//       permanentThana: schema.permanentThana,
//       skill: schema.skill.required(),
//     }),
//   }),
//   resetPassword: Joi.object().keys({
//     body: Joi.object().keys({
//       password: schema.password,
//       token: Joi.string(),
//     }),
//   }),
//   changePassword: Joi.object().keys({
//     body: Joi.object().keys({
//       newPassword: schema.password,
//       oldPassword: schema.password,
//     }),
//   }),
// };

exports.signupValidation = data =>
Joi.object({
      fullName: schema.fullName.required(),
      email: schema.email.required(),
      password: schema.password.required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required(),
      contactNo: schema.contactNo.required(),
      transaction: schema.transaction.required(),
}).validate(data);  