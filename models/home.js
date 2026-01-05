
const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
    houseName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },

    host: [{
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            }]
});

  

module.exports = mongoose.model('Home', homeSchema);