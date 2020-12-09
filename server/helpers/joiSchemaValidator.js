const Joi = require('joi');
const _ = require('lodash');
const {
  sendErrorResponse,
  sendJSONresponse,
} = require('../helpers/jsonResponse');

module.exports = (schema, property) => {

  // Joi validation options
  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  };

  // return the validation middleware
  return (req, res, next) => {
    console.log(req.body);
    Joi
      .validate(req[property], schema)
      .then((validatedChanges) => {
        req.body = validatedChanges.body;
        next();
        return null;
      })
      .catch((validationError) => {
        const JoiError = {
          type: 'ValidationError',
          status: 400,
          errors: validationError.details.map((d) => {
            return {
              message: d.message.replace(/['"]/g, ''),
              fieldName: d.path[1],
            };
          }),
        };
        const customError = {
          error:
            'Invalid request data. Please review request and try again.',
        };
        return sendJSONresponse(
          res,
          400,
          _useJoiError ? JoiError : customError,
        );
      });
  };
};
