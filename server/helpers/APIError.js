const httpStatus = require('http-status');

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, status, isPublic) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
  ) {
    super(message, status, isPublic);
  }
}

class EmailIdExistError extends ExtendableError {
  constructor(
    name,
    message,
    status = httpStatus.CONFLICT,
    isPublic = true,
  ) {
    super(name, message, status, isPublic);
  }
}

class BadRequestError extends ExtendableError {
  constructor(
    message,
    status = httpStatus.BAD_REQUEST,
    isPublic = true,
  ) {
    super(message, status, isPublic);
  }
}

class SearchNotMatchError extends ExtendableError {
  constructor(
    message,
    status = httpStatus.NOT_FOUND,
    isPublic = true,
  ) {
    super(message, status, isPublic);
  }
}

module.exports = {
  APIError,
  EmailIdExistError,
  BadRequestError,
  SearchNotMatchError,
};
