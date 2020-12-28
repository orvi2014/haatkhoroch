const express = require('express');
const passportService = require('../services/passport.services');
const router = express.Router();

const jobCtrl = require('./job.controller');
const {
  authorization,
} = require('../middlewares/authorizationMiddleware');
const {
  authentication,
} = require('../middlewares/authenticationMiddleware');
// authentication

router.route('/').post(jobCtrl.createJob);
router.route('/apply').put(authorization, jobCtrl.applyJob);
router.route('/completed').get(authorization, jobCtrl.completeJob);
router.route('/applied').get(authorization, jobCtrl.appliedJob);
router.route('/list').get(jobCtrl.jobListView);
router.route('/applied-list').get(authorization, jobCtrl.appliedJobAccount);


module.exports = router;
