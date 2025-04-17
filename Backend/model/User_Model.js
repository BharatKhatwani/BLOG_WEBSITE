const mongoose = require('mongoose');

// Define Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  fullname: {
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
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  profileImage: {
    type: String,
    default: ""
  },
  coverImage: {
    type: String,
    default: ""
  },
  link: {
    type: String,
    default: ""
  }, 
  likedPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ]
}, { timestamps: true });

// Create Model
const User = mongoose.model("User", UserSchema);

// Export
module.exports = { User };