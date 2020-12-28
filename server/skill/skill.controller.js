const { Skill} = require('./skill.model');
const logger = require('../../config/winston');
const {
    sendJSONresponse,
    sendErrorResponse,
  } = require('../helpers/jsonResponse');

const skill = async (req, res, next) => {
    try {
        const skillList = await Skill.find({});
        return sendJSONresponse(res, 200, skillList);
    } catch (error) {
        logger.error(`Skill: ${err}`);
        next(err);
    }
};

module.exports = {
    skill
}