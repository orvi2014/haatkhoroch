const passport = require('passport');
const { sendErrorResponse } = require('../helpers/jsonResponse');
module.exports.authentication = (req, res, next) => {
  passport.authenticate('local', { session: false }, function (
    err,
    user,
    info,
  ) {
    console.log(user);
    if (err) {
      return next(err);
    }
    if (!user) {
      return sendErrorResponse(res, 401, 'AuthError', {
        message: 'Mismatch Credentials',
      });
    }
    if (!user.isAccountVerified) {
      return sendErrorResponse(res, 401, 'VerificationError', {
        message: 'Your account is not verified yet',
      });
    };

    if (!user.isPaid) {
      return sendErrorResponse(res, 401, 'VerificationError', {
        message: 'Payment is not clear yet',
      });
    }
    req.user = user; // Forward user information to the next middleware
    next();
  })(req, res, next);
};
