const mongoose = requrie('mongoose')
const userSchema  = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    role: [{type: String}],
    isVerified: {type: Boolean, default: false},
    password: String,
    passwordResetToken: String,
    passwordResetExpire: Date,
    }, schemaOptions)


    module.exports = userSchema