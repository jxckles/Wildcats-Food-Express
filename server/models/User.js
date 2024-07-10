const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  courseYear: String,
  email: String,
  password: String,
  role: {type: String, enum: ['Admin', 'User'], default: 'User'},
});



const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
