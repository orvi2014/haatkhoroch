const express = require('express');
const router = express.Router();

const skillCtrl = require('./skill.controller');
// authentication

router.route('/list').post(skillCtrl.skill);

module.exports = router;
