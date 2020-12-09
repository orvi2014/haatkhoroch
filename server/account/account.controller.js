const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('./account.model');
const config = require('../../config/config');
const logger = require('../../config/winston');
const client = require('../../index.redis');
const {
  signupValidation
} = require('./account.validation');
const {
  sendEmailForVerifyAccount,
  sendEmailForResetPassword,
} = require('../services/email.services');
const {
  addTokenToBlackList,
  accountVerificationToken,
} = require('../services/redis.services');
const {
  sendJSONresponse,
  sendErrorResponse,
} = require('../helpers/jsonResponse');

const { createSlug } = require('../helpers/SlugCreator');
// create a new account for individual users
const register = async (req, res, next) => {
 
  if (!req.is('application/json')) {
    return sendErrorResponse(res, 406, 'contentTypeError', { reason: `Expects 'application/json'`});
  };
const data = req.body;
const { error } = signupValidation(data);
if (error){
    return sendErrorResponse(res, 400, 'validationError',{
         missingField: error.details[0].path,
         message: error.details[0].message.replace(/['"]/g, ''),
    });
};
  let name = '';
  await Account.countDocuments({
    fullName: data.fullName,
  })
    .exec()
    .then((result) => {
      let fullName = createSlug(data.fullName);
      let uniqueId = result + 1;
      name = fullName +'-'+ uniqueId;
    });
  let account = new Account({
    email: data.email,
    fullName: data.fullName,
    userName: name,
    contactNo: data.contactNo,
    password: data.password,
    transaction: data.transaction,
  });
  await account
    .save()
    .then(async (user) => {
      let token = crypto.randomBytes(20).toString('hex');
      let verifyToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      let verifyAccountTokenExpiration = Date.now() + 604800;
      sendEmailForVerifyAccount(
        user.firstName,
        user.lastName,
        user.email,
        verifyToken,
      );
      accountVerificationToken(
        `verifyAccountToken:${verifyToken}`,
        user._id,
        verifyAccountTokenExpiration,
      );
      return sendJSONresponse(res, 201, {
        message: 'User created',
        verifyToken: verifyToken,
      });
    })
    .catch((err) => {
      logger.error(`Account: ${err}`);
      next(err);
    });
};
/**
 * Returns jwt token if valid uname and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {* token}
 */

// account holder can login their account
const login = async (req, res, next) => {
  try {
    const payLoad = {
      email: req.user.email,
      userName: req.user.userName,
      _id: req.user._id,
    };
    const accessToken = jwt.sign(payLoad, config.accessTokenSecret, {
      expiresIn: config.accessTokenExpire,
    });
    const refreshToken = jwt.sign(
      payLoad,
      config.refreshTokenSecret,
      {
        expiresIn: config.refreshTokenExpire,
      },
    );
    // addUserDataIntoCache(req.user._id, req.user);
    return sendJSONresponse(res, 200, {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(`${error}`);
    next(error);
  }
};

const getAccount = async (req, res, next) => {
  try {
    const userInfo = await Account.findOne({
      _id: req.user._id,
    })
      .select('-password')
    // console.log(userInfo);
    return sendJSONresponse(res, 200, {
      success: true,
      user: userInfo,
    });
  } catch (error) {
    logger.error(`${error}`);
    next(error);
  }
};
// client
//   .multi()
//   .get(`userID:${req.user.email}`)
//   .execAsync()
//   .then(result => {
//     let user = JSON.parse(result);
//     return sendJSONresponse(res, 200, {
//       success: true,
//       user: user,
//     });
//   })
//   .catch(err => {
//     console.log(err);
//     next(err);
//   });

// token verification for mail
const getAccessTokenForVerifyAccount = async (req, res, next) => {
  try {
    let multi = client.multi();
    multi.get(`verifyAccountToken:${req.params.token}`);
    multi.exec(async (err, data) => {
      if (err) {
        logger.error(`${err}`);
        next(err);
      }
      let userID = JSON.parse(data[0]);
      if (typeof userID === 'string') {
        const user = await Account.findByIdAndUpdate(
          { _id: userID },
          { $set: { isAccountVerified: true } },
          { safe: true, upsert: true, new: true },
        ).exec();
        client.del(`verifyAccountToken:${req.params.token}`);
        return sendJSONresponse(res, 200, {
          isAccountVerified: true,
          message: 'Account Verified Successfully',
        });
      } else {
        return sendErrorResponse(res, 400, 'TokenExpireError', {
          isAccountVerified: false,
          message: 'Link is expired',
        });
      }
    });
  } catch (err) {
    next(err);
  }
};
// account holder can update their account information
const accountUpdate = async (req, res, next) => {
  await Account.findOneAndUpdate(
    {
      email: req.user.email,
    },
    req.body,
    {
      safe: true,
      upsert: true,
      new: true,
    },
  )
    .select('-password')
    .exec()
    .then(async (user) => {
      if (user) {
        // if (typeof user.about !== 'undefined') {
        //   client.hmset(`userID:${user._id}`, 'about', user.about);
        //   logger.info(`about added into ${user.email}'s cache`);
        // }
        // if (typeof user.location !== 'undefined') {
        //   client.hmset(
        //     `userID:${user._id}`,
        //     'location',
        //     user.location,
        //   );
        //   logger.info(`location added into ${user.email}'s cache`);
        // }
        // if (typeof user.gender !== 'undefined') {
        //   client.hmset(`userID:${user._id}`, 'gender', user.gender);
        //   logger.info(`gender added into ${user.email}'s cache`);
        // }
        // if (typeof user.bloodGroup !== 'undefined') {
        //   client.hmset(
        //     `userID:${user._id}`,
        //     'bloodGroup',
        //     user.bloodGroup,
        //   );
        //   logger.info(`bloodGroup added into ${user.email}'s cache`);
        // }
        // if (typeof user.position !== 'undefined') {
        //   client.hmset(
        //     `userID:${user._id}`,
        //     'position',
        //     user.position,
        //   );
        //   logger.info(`postion added into ${user.email}'s cache`);
        // }

        return sendJSONresponse(res, 200, {
          message: 'profile updated',
        });
      }
    })
    .catch((err) => {
      logger.error(`${err}`);
      next(err);
    });
};
const logout = async (req, res, next) => {
  try {
    let refreshToken = req.body.refreshToken;
    let accessToken = req.headers.authorization.split(' ')[1];
    let accessTokenExpire =
      req.user.exp * 1000 +
      new Date(req.user.exp * 1000).getTimezoneOffset() * 60 * 1000 -
      (Date.now() +
        new Date(Date.now()).getTimezoneOffset() * 60 * 1000);
    if (refreshToken) {
      await jwt.verify(
        refreshToken,
        config.refreshTokenSecret,
        (err, user) => {
          if (err) {
            return sendErrorResponse(res, 401, 'AuthError', {
              message: err.message,
              fieldName: 'headers',
            });
          }
          let refreshTokenExpire =
            user.exp * 1000 +
            new Date(user.exp * 1000).getTimezoneOffset() *
              60 *
              1000 -
            (Date.now() +
              new Date(Date.now()).getTimezoneOffset() * 60 * 1000);
          addTokenToBlackList(accessToken, accessTokenExpire);
          addTokenToBlackList(refreshToken, refreshTokenExpire);
          logger.info('Account successfully Logout');
          return sendJSONresponse(res, 200, {
            success: true,
            message: 'Successfully logout',
          });
        },
      );
    }
  } catch (error) {
    next(error);
  }
};

const sendEmailForForgetPassword = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(20).toString('hex');
    const verifyToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const user = await Account.findOne({
      email: req.body.email,
    });
    if (!user)
      return sendErrorResponse(res, 404, 'UserNotFoundError', {
        message: 'no user found',
        fieldName: 'email',
      });
    sendEmailForResetPassword(
      user.firstName,
      user.lastName,
      user.email,
      verifyToken,
    );
    let resetPasswordTokenExpiration = Date.now() + 86400; // 1 day
    accountVerificationToken(
      `resetPasswordToken:${verifyToken}`,
      user._id,
      resetPasswordTokenExpiration,
    );
    logger.info(`send reset password mail to user successfully`);
    return sendJSONresponse(res, 200, {
      message: 'Mail send successfully',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password, token } = req.body;
    let multi = client.multi();
    multi.get(`resetPasswordToken:${token}`);
    multi.exec(async (err, data) => {
      if (err) {
        logger.error(`${err}`);
        next(err);
      }
      let userID = JSON.parse(data[0]);
      if (typeof userID === 'string') {
        const user = await Account.findById({
          _id: userID,
        });
        user.password = password;
        await user.save();
        logger.info(`password successfully change`);
        client.del(`resetPasswordToken:${token}`);
        logger.info(`delete reset password token from tokenList`);
        return sendJSONresponse(res, 200, {
          message: 'Password Changed',
        });
      } else {
        return sendErrorResponse(res, 401, 'TokenExpireError', {
          message: 'Time is expired',
        });
      }
    });
  } catch (err) {
    logger.error(`password does not change`);
    next(err);
  }
};

const tokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    // check if a refresh token exist in blacklist
    let isBlackListed;
    let multi = client.multi();
    multi.get(`BlackList:${refreshToken}`);
    multi.exec(function (err, data) {
      // if data object is null token is not blacklisted
      if (data[0] === null) {
        isBlackListed = false;
      } else {
        isBlackListed = true;
      }
    });

    if (isBlackListed) {
      return sendErrorResponse(res, 401, 'AuthError', {
        message: 'invalid token',
      });
    } else {
      await jwt.verify(
        refreshToken,
        config.refreshTokenSecret,
        async function (err, user) {
          if (err) {
            return sendErrorResponse(res, 401, 'AuthError', {
              message: err.message,
            });
          }
          const payLoad = {
            email: user.email,
            _id: user._id,
            name: user.name,
          };
          // convert to msec
          // add local time zone offset
          // get UTC time in msec
          // create new Date object for different city
          const refreshTokenExpire =
            user.exp * 1000 +
            new Date(user.exp * 1000).getTimezoneOffset() *
              60 *
              1000 -
            (Date.now() +
              new Date(Date.now()).getTimezoneOffset() * 60 * 1000);
          const oldAccessToken = req.body.accessToken;
          await jwt.verify(
            oldAccessToken,
            config.accessTokenSecret,
            (err, verified) => {
              // if access token expired
              // add refresh token in blacklist
              // make new access and refresh token
              if (err) {
                addTokenToBlackList(refreshToken, refreshTokenExpire);
                const accessToken = jwt.sign(
                  payLoad,
                  config.accessTokenSecret,
                  {
                    expiresIn: config.accessTokenExpire,
                  },
                );
                const newRefreshToken = jwt.sign(
                  payLoad,
                  config.refreshTokenSecret,
                  {
                    expiresIn: config.refreshTokenExpire,
                  },
                );
                const response = {
                  accessToken: accessToken,
                  token_type: 'Bearer',
                  refreshToken: newRefreshToken,
                };
                return sendJSONresponse(res, 200, response);
              } else {
                let oldAccessTokenExpire =
                  verified.exp * 1000 +
                  new Date(verified.exp * 1000).getTimezoneOffset() *
                    60 *
                    1000 -
                  (Date.now() +
                    new Date(Date.now()).getTimezoneOffset() *
                      60 *
                      1000);
                addTokenToBlackList(
                  oldAccessToken,
                  oldAccessTokenExpire,
                );
                addTokenToBlackList(refreshToken, refreshTokenExpire);
                const accessToken = jwt.sign(
                  payLoad,
                  config.accessTokenSecret,
                  {
                    expiresIn: config.accessTokenExpire,
                  },
                );
                const newRefreshToken = jwt.sign(
                  payLoad,
                  config.refreshTokenSecret,
                  {
                    expiresIn: config.refreshTokenExpire,
                  },
                );
                const response = {
                  accessToken: accessToken,
                  token_type: 'Bearer',
                  refreshToken: newRefreshToken,
                };
                return sendJSONresponse(res, 200, response);
              }
            },
          );
        },
      );
    }
  } catch (err) {
    logger.error(`${err}`);
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { oldPassword, newPassword } = req.body;
    if (oldPassword === newPassword) {
      return sendErrorResponse(res, 400, 'ValidationError', {
        message: `You can not use the same password`,
      });
    }
    await Account.findOne({
      email: user.email,
    }).exec((err, user) => {
      if (err) {
        next(err);
      }
      user.comparePassword(oldPassword, async (err, isMatched) => {
        if (err) {
          return next(err);
        }
        if (isMatched) {
          user.password = newPassword;
          await user.save();
          return sendJSONresponse(res, 200, {
            message: 'Password changed successfully',
          });
        } else {
          return sendErrorResponse(
            res,
            401,
            'PasswordValidationError',
            {
              message: `Your previous password is wrong`,
            },
          );
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

const resendEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const resentType = req.body.resentType;
    const token = crypto.randomBytes(20).toString('hex');
    const verifyToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const user = await Account.findOne({
      email: email,
    });
    if (!resentType) {
      return sendErrorResponse(res, 400, {
        message: 'Please provide resent-type',
      });
    }
    if (resentType === 'verify-account') {
      let verifyAccountTokenExpiration = Date.now() + 604800;
      sendEmailForVerifyAccount(
        user.firstName,
        user.lastName,
        user.email,
        verifyToken,
      );
      accountVerificationToken(
       `verifyAccountToken:${verifyToken}`,
        user._id,
        verifyAccountTokenExpiration,
      );
    }
    return sendJSONresponse(res, 200, {
      message: 'resend email successfully',
    });
  } catch (error) {
    logger.error(`Account: ${error}`);
    next(error);
  }
};
module.exports = {
  register,
  resendEmail,
  login,
  logout,
  getAccessTokenForVerifyAccount,
  getAccount,
  accountUpdate,
  tokenRefresh,
  sendEmailForForgetPassword,
  resetPassword,
  changePassword,
};
