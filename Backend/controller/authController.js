


const express = require("express");
const { User } = require("../model/User_Model.js");
const bcrypt = require("bcrypt");
const generateTokenAndSetCookies = require("../lib/utils/generateToken.js");
const jwt = require("jsonwebtoken");


const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    // Basic validation
    if (!username || !fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email is not valid" });
    }

    // Check existing user/email
    const existUser = await User.findOne({ username });
    if (existUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username,
      fullname,
      email,
      password: hashPassword,
    });

    await newUser.save();

    // Generate Token
    const token = generateTokenAndSetCookies(newUser._id, res);

    // Send response
    res.status(201).json({
      message: "User created successfully",
      token, // optional if you want to use in frontend
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profile_image: newUser.profile_image,
        coverImage: newUser.coverImage,
        link: newUser.link,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check user
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid username" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate Token
    const token = generateTokenAndSetCookies(existingUser._id, res);

    // Response
    res.status(200).json({
      message: "Login successful",
      token, // optional
      user: {
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        followers: existingUser.followers,
        following: existingUser.following,
        profile_image: existingUser.profile_image,
        coverImage: existingUser.coverImage,
        link: existingUser.link,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const logout = async (req,res)=>{
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
    }
}
const  getMe = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
    res.status(200).json({
      message: "User fetched successfully",
      user
    });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = {
    login , logout, signup, getMe
}