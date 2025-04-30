const express = require('express');
const app = express();
const User = require('../model/User_Model.js');
const bcrypt = require('bcrypt');
const generateTokenandSetCookie = require('../lib/utils/generateToken.js')

const signup = async (req, res) => {
    try {
        const { username, fullname, email, password } = req.body;
        const emailRegex = /^\S+@\S+\.\S+$/;

        // Validate if all fields are provided
        if (!username || !email || !fullname || !password) {
            return res.status(400).send('Something in the input field is missing');
        }

        // Check if username already exists
        const existUser = await User.findOne({ username });
        if (existUser) {
            return res.status(400).send("Username is already registered");
        }

        // Check if email already exists
        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).send("Email is already registered");
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).send("Invalid email format");
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user and save it to the DB
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            await newUser.save();
            console.log('User saved successfully');

            // Generate JWT token and set it in cookie
     const token =        generateTokenandSetCookie(newUser._id, res);
     console.log("Token", token);

            // Send success response with user details (excluding password)
            res.status(201).json({
                token, // Send the token
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    fullname: newUser.fullname,
                    profileImg: newUser.profileImg,
                    coverImg: newUser.coverImg,
                    bio: newUser.bio,
                    link: newUser.link,
                    followers: newUser.followers,
                    following: newUser.following
                }
            });
        } else {
            res.status(500).json({
                message: "Invalid User DATA"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
};


const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // 2. Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // 4. Generate token & set cookie
        const token = generateTokenandSetCookie(user._id, res); // Capture the token

        // 5. Send response
        res.status(200).json({
            message: "Login successful",
            token, // Send the token in the response body
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link,
                followers: user.followers,
                following: user.following
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// module.exports = login;

const logout = async (req, res) => {
    try {
        // 1. Use clearCookie to remove the 'jwt' cookie
        res.clearCookie('jwt', {
            httpOnly: true,          // Prevents access to the cookie from JavaScript
            sameSite: 'strict',      // Helps prevent CSRF attacks
            secure: process.env.NODE_ENV === 'production', // Secure only on HTTPS in production
        });

        // 2. Send a response to the client
        res.status(200).json({
            message: "Logged out successfully!",
        });
    } catch (error) {
        // Handle any errors that occur
        console.log(error);
        res.status(500).json({
            message: "Something went wrong.",
        });
    }
};
const getMe = async(req,res) =>{
    try {
    const user = await User.findById(req.user_id).select('-password');
    res.status(200).json({user})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "Internal Server error"
        })
    }
}


module.exports = { signup, login, logout , getMe};
