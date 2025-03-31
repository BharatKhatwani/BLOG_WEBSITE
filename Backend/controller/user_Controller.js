const express = require('express');
const cloudinary = require('cloudinary').v2;

const { User } = require('../model/User_Model');
const Notification = require('../model/notification_schema');
const bcrypt = require('bcrypt');
// ✅ Get User Profile by Username
const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.log('Error in user details:', error);
    res.status(500).json({
      error: 'Error fetching user profile',
    });
  }
};

// ✅ Follow / Unfollow User
const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // The user to follow/unfollow

    // 1. User to be followed/unfollowed
    const userToModify = await User.findById(id);
    // 2. Currently logged-in user
    const currentUser = await User.findById(req.user.id);

    // ❌ Self-follow check
    if (id === req.user.id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    // ❌ User existence check
    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Check if already following
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // 🔥 Unfollow logic
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user.id } });
      return res.json({ message: 'Unfollowed successfully' });
    } else {
      // 🚀 Follow logic
      await User.findByIdAndUpdate(req.user.id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user.id } });

      // ✅ Create Notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user.id,
        to: id,
      });
      await newNotification.save();

      return res.json({ message: 'Followed successfully & notification sent' });
    }
  } catch (error) {
    console.log('Follow/Unfollow Error:', error);
    res.status(500).json({
      error: 'Error performing follow/unfollow action',
    });
  }
};


const  getSuggestedUser = async (req,res) =>{
   try {
    const  currentlogin = await User.findById(req.user.id);
    if(!currentlogin){
      return res.status(404).json({ error: 'User not found' });
    }
 const suggestedUser = await User.find({
  _id : {$ne : req.user.id , $nin: currentlogin.following}  // ne not for that and nin ka mtlb nahi follow krne wale
 }).select('-password').limit(10);
return res.json(suggestedUser);
    
   } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Error fetching suggested users'});
   }
} 

const Updateuser = async (req, res) => {
  const userId = req.user.id; // Use `id` directly from `req.user`

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { fullname, email, username, currentpassword, newPassword, bio, link } = req.body;
    let { profileImage, coverImage } = req.body;

    // Password update logic
    if (newPassword && !currentpassword) {
      return res.status(400).json({ error: 'Please enter current password and new password' });
    }

    if (newPassword && currentpassword) {
      const isValidPassword = await bcrypt.compare(currentpassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid current password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Profile Image update logic
    if (profileImage) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImage);
      user.profileImage = uploadedResponse.secure_url;
    }

    // Cover Image update logic
    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImage);
      user.coverImage = uploadedResponse.secure_url;
    }

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();
    user.password = null; // Remove password from response

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

module.exports = { getUserProfile, followUnfollowUser,  getSuggestedUser,Updateuser };



/*
 Usage:

Use req.user._id when working directly with MongoDB queries.

Use req.user.id when you need a string representation for comparisons or API responses.
*/ 