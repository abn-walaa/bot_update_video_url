const mongoose = require('mongoose');

(async () => {

    await mongoose.connect("mongodb://127.0.0.1:27017/hammed");
    console.log("DB connected")
})();

module.exports = mongoose;