const express = require('express');
const app = express();
const User = require('../model/User_Model.js');
const mongoose = require('mongoose')

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



module.exports = { getUserProfile , followUnFollower, getSuggestedUser};
