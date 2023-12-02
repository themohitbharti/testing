const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const Text = mongoose.model('Text', textSchema);

module.exports = Text;

