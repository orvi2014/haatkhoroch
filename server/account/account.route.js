const express = require('express');
const passportService = require('../services/passport.services');
const router = express.Router();

const accountCtrl = require('./account.controller');
const {
  authorization,
} = require('../middlewares/authorizationMiddleware');
const {
  authentication,
} = require('../middlewares/authenticationMiddleware');
// authentication
router
  .route('/signup')
  .post(
    accountCtrl.register,
  );
router.route('/resend-email').post(accountCtrl.resendEmail);
router.get(
  '/verify-account/:token',
  accountCtrl.getAccessTokenForVerifyAccount,
);
router
  .route('/login')
  .post(
    authentication,
    accountCtrl.login,
  );

router.route('/').get(authorization, accountCtrl.getAccount);
// router
//   .route('/update')
//   .put(
//     authorization,
//     schemaValidator(paramValidation.update),
//     accountCtrl.accountUpdate,
//   );
router.route('/logout').get(authorization, accountCtrl.logout);
// router
//   .route('/forget-password')
//   .post(accountCtrl.sendEmailForForgetPassword);
// router
//   .route('/reset-password/')
//   .put(
//     schemaValidator(paramValidation.resetPassword),
//     accountCtrl.resetPassword,
//   );
// router
//   .route('/change-password')
//   .put(
//     authorization,
//     schemaValidator(paramValidation.changePassword),
//     accountCtrl.changePassword,
//   );
// router.route('/refresh').post(accountCtrl.tokenRefresh);
// for admin
// router
//   .route('/admin')
//   .post(requireLogin, permit('admin'), accountCtrl.login);

module.exports = router;
