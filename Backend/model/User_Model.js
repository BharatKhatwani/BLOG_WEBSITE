// const express = require('express'); // You don't need express here
const mongoose = require('mongoose'); // You wrote 'mongodb', but it should be 'mongoose'

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
    unique: true // It's good practice to make email unique
  },
  password: {
    type: String,
    required: true
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Always reference the Model name
      default: []
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
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
  }
}, { timestamps: true }); // You wrote 'timestamp', correct option is 'timestamps'

// Create Model
const User = mongoose.model("User", UserSchema);

// Export
module.exports = { User };
