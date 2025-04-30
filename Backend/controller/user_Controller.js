const express = require('express');
const app = express();
const {v2 : cloudinary} = require('cloudinary');
const User = require('../model/User_Model.js');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params; // Extract username from route params
    const user = await User.findOne({ username }).select("-password"); // Use User model

    if (!user) {
      return res.status(404).json({
        message: "User NOT FOUND"
      });
    }

    res.status(200).json(user); // Send user profile
  } catch (error) {
    console.log("Error in getUserProfile:", error);
    res.status(500).json({
      error: error.message
    });
  }
};

const followUnFollower = async (req, res) => {
    try {
        const currentUserId = req.user._id; // From protectedRoute middleware
        const targetUserId = req.params.id;

        if (currentUserId.toString() === targetUserId) {
            return res.status(400).json({ message: "You cannot follow/unfollow yourself." });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found." });
        }

        const isFollowing = targetUser.followers.includes(currentUserId);

        if (isFollowing) {
            // Unfollow
            targetUser.followers.pull(currentUserId);
            currentUser.following.pull(targetUserId);
            await targetUser.save();
            await currentUser.save();
            return res.status(200).json({ message: "Unfollowed successfully." });
        } else {
            // Follow
            targetUser.followers.push(currentUserId);
            currentUser.following.push(targetUserId);
            await targetUser.save();
            await currentUser.save();
            const newNotification = new Notification ({
                type : 'follow',
                from : req.user._id,
                to:currentUser_id
            })
            await newNotification.save();
            return res.status(200).json({ message: "Followed successfully." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};


const getSuggestedUser = async (req, res) => {
  try {
    const userID = req.user._id; // Assuming the protectedRoute middleware sets req.user

    // 1. Get the current user's following list
    const currentUser = await User.findById(userID).select('following');
    const followingIds = currentUser.following.map(id => id.toString());

    // 2. Add current user's own ID to exclusion list
    followingIds.push(userID.toString());

    // 3. Fetch random users not in the following list (using $nin and $ne)
    const users = await User.aggregate([
      {
        $match: {
          _id: { $nin: followingIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      { $sample: { size: 10 } } // Randomly sample 10 users
    ]);

    // 4. Limit to 4 and remove sensitive data like password
    const suggestedUsers = users.slice(0, 4).map(user => {
      delete user.password;
      return user;
    });

    // 5. Return the list
    res.status(200).json({ suggestedUsers });
  } catch (error) {
    console.log("Error in getSuggestedUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      fullname,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
      profileImg,
      coverImg
    } = req.body;

    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if ((newPassword && !currentPassword) || (!newPassword && currentPassword)) {
      return res.status(400).json({ message: "Please provide both current and new passwords" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImgPublicId) {
        // await cloudinary.uploader.destroy(user.profileImgPublicId);
        await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);

      }
      const uploadRes = await cloudinary.uploader.upload(profileImg, { folder: 'profileImages' });
      user.profileImg = uploadRes.secure_url;
      user.profileImgPublicId = uploadRes.public_id;
    } 

    if (coverImg) {
      if (user.coverImgPublicId) {
         await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
      }
      const uploadRes = await cloudinary.uploader.upload(coverImg, { folder: 'coverImages' });
      user.coverImg = uploadRes.secure_url;
      user.coverImgPublicId = uploadRes.public_id;
    }

    // Update other fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ user: userObj });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


module.exports = { getUserProfile , followUnFollower, getSuggestedUser, updateUserProfile};
