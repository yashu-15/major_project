const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    items: [
        {
            itemName: String,
            quantity: Number,
            imageUrl: String,
        }
    ]
});

module.exports = mongoose.model("User", userSchema);
