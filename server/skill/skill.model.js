const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    version: {
        type: Number,
        default: 0,
      },
 
},{
    timestamps: true,
  },)

  let Skill = mongoose.model(`Skill`, skillSchema); 
  module.exports = {
      Skill
  }