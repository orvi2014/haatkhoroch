const express = require('express');
const accountRoutes = require('./server/account/account.route');
const jobRoutes = require('./server/job/job.route');
const fileRoutes = require('./server/file/file.route');
const categoryRoutes = require('./server/category/category.route');
const skillRoutes = require('./server/skill/skill.route');

// const authRoutes = require('./server/auth/auth.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/accounts', accountRoutes);
router.use('/jobs', jobRoutes);
router.use('/category', categoryRoutes);
router.use('/files', fileRoutes);
router.use('/skills', skillRoutes);

// mount auth routes at /auth
// router.use('/auth', authRoutes);

module.exports = router;
