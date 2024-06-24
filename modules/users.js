let mongoose = require('../db/db');

let userS = new mongoose.Schema({
    user_id: {
        unique: true,
        type: Number,
        required: true
    },
    is_bot: {
        type: Boolean
    },
    name: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})


let user = mongoose.model("users", userS)

module.exports = user;