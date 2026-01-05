const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true
    },
    user_type: {
        type: String,
        required: true,
        enum: ['guest', 'host']        
    },

    favouriteHomes: [{
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Home',
            }],

    otp: String,
    otpExpiration: Date,
})

  

module.exports = mongoose.model('User', userSchema);