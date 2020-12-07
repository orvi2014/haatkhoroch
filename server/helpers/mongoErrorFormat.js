const { APIError } = require('../helpers/APIError');
const logger = require('../../config/winston');
const {
  sendJSONresponse,
  sendErrorResponse,
} = require('../helpers/jsonResponse');

const mongoErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.errmsg;
  if (err.code === 11000 || err.code === 11001) {
    const pathRegex = err.message
      .split('index: ')[1]
      .split('dup key')[0]
      .split('_')[0];
    const keyRegex = err.message.match(/key:\s+{\s+:\s\"(.*)(?=\")/);
    const key = keyRegex ? keyRegex[1] : '';
    const output = {
      message: `${pathRegex} already exists`,
      fieldName: pathRegex,
    };
    logger.error(`${error.name}: ${pathRegex}`);
    return sendErrorResponse(res, 409, 'DuplicateKeyError', output);
  }

  // Mongoose bad objectID
  if (error.name === 'CastError') {
    const message = `Resource not found with ID of ${error.value}`;
    error = new APIError(message, 404);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(
      (val) => val.message,
    );
    error = new APIError(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
};

module.exports = mongoErrorHandler;
