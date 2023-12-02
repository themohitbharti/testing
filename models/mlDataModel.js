const mongoose = require('mongoose');

const mldataSchema = new mongoose.Schema({
  key: String,
  value: Number,
});

const MlData = mongoose.model('MlData', mldataSchema);

module.exports = MlData;
