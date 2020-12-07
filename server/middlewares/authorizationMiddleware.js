const jwt = require('jsonwebtoken');
const redis = require('redis');
const bluebird = require('bluebird');
const config = require('../../config/config');
const { sendErrorResponse } = require('../helpers/jsonResponse');
const client = require('../../index.redis');
bluebird.promisifyAll(redis);

module.exports.authorization = async (req, res, next) => {
  const parts =
    req.headers['x-access-token'] || req.headers.authorization;
  if (!parts) {
    return sendErrorResponse(res, 401, 'AuthError', {
      message: 'Invalid header',
    });
  }
  let isBlackListed;
  let bearerToken = parts.split(' ')[1];
  let multi = client.multi();
  multi.get(`BlackList:${bearerToken}`);
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
  }
  jwt.verify(bearerToken, config.accessTokenSecret, function (
    err,
    decoded,
  ) {
    if (err) {
      return sendErrorResponse(res, 401, 'AuthError', {
        message: err.message,
      });
    }
    req.user = decoded;
    next();
  });
};
