const logger = require('../../config/winston');
const client = require('../../index.redis');
module.exports.addTokenToBlackList = async (token, tokenExpire) => {
  await client.set(`BlackList:${token}`, token, 'PX', tokenExpire);
  logger.info(`access and refresh token add to blacklist`);
};
module.exports.accountVerificationToken = async (
  token,
  userID,
  tokenExpire,
) => {
  await client.set(token, JSON.stringify(userID), 'PX', tokenExpire);
  logger.info(`token add into token verification key`);
};

// module.exports.addImageDataIntoCache = async (
//   userId,
//   field,
//   value,
// ) => {
//   await client.hmset(`userID:${userId}`, field, value);
// };

// module.exports.addUserDataIntoCache = async (userId, userData) => {
//   // await client.set(`userID:${userId}`, JSON.stringify(userData));
//   await client.hmset(
//     `userID:${userId}`,
//     'name',
//     userData.name,
//     'firstName',
//     userData.firstName,
//     'lastName',
//     userData.lastName,
//     'birthDate',
//     userData.birthDate,
//     'contactNo',
//     userData.contactNo,
//     '_id',
//     userData._id,
//   );
//   logger.info(`User data add into cache server`);
// };

// module.exports.addSkillIntoCache = async (userId, skillObject) => {
//   await client.hmset(`userID: ${userId}`, 'skillArea', skillObject);
//   logger.info(`create multiple skills for user`);
// };
