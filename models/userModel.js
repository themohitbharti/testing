


const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const assignedTeamsSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
    unique: false,
  },
  isLoggedIn: {
    type: String,
    required: false,
    enum: ['Yes', 'No'],
    default: 'No',
  },
  assignedTeams: [assignedTeamsSchema], // Array of assigned teams
  otp: {
    type: String,
    required: false,
    default: 0,
  },
});

userSchema.plugin(findOrCreate);
const User = mongoose.model('User', userSchema);

module.exports = User;
