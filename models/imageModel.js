const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    imgName: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
});

module.exports = mongoose.model('Image', imageSchema);
