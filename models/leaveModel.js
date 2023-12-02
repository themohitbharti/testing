const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    teamId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    leaves: [
      {
        startDate: {
          type: String,
          required: true,
        },
        endDate: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    ],
    Status:{
        type:String,
        required:true,
        unique:false,
    },
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
