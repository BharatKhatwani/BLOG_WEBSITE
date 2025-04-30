const express = require('express');
const User = require('../model/User_Model');
const Post = require('../model/post_schema'); // ✅ Required
const { v2: cloudinary } = require('cloudinary');
const Notification = require('../model/notification_schema')

const createPost = async (req, res) => {
    // console.log("There hit create Post")
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or an image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url; // ✅ Correct key
    }

    const newPost = new Post({
      user: userId,
      text,
      img
    });

    await newPost.save();

    return res.status(201).json(newPost);

  } catch (error) {
    console.error("ERROR in createPost controller:", error);
    res.status(500).json({ error: error.message }); // ✅ Corrected
  }
};

const deletePost = async (req, res) => {
    // console.log("hit the delete post ")
    try {
         
      const postId = req.params.id;
      const user = req.user._id;
  
      const post = await Post.findById(postId);
      console.log(post)
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      const isOwner = post.user.toString() === user.toString();
      if (!isOwner) {
        return res.status(403).json({ message: "You are not allowed to delete this post" });
      }
      if(post.img){
        const imgId = post.img.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imgId)
      }
  
      await Post.findByIdAndDelete(postId);
      res.status(200).json({ message: "Post successfully deleted" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  const commentPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const user = req.user._id;
      const { text } = req.body;
  
      const post = await Post.findById(postId); // fixed variable
      if (!post) {
        return res.status(404).json({
          message: "Post not found"
        });
      }
  
      if (post.user.toString() === user.toString()) {
        return res.status(400).json({
          message: "You cannot comment on your own post"
        });
      }
  
      const comment = { user: user, text }; // fixed variable name
      console.log(comment)
      post.comments.push(comment); // your schema has "comment" (not "comments")
  
      await post.save();
  
      return res.status(200).json(post);
  
    } catch (error) {
      console.log("ERROR IN THE COMMENT POST", error);
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  };
  const likeAndUnlikePost = async (req, res) => {
    console.log("make them hits");
  
    try {
      const userId = req.user._id;
      const postId = req.params.id;
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      const userLikedPost = post.likes.includes(userId);
  
      if (userLikedPost) {
        // Unlike the post
        await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
        return res.status(200).json({ message: "Post unliked successfully" });
      } else {
        // Like the post
        post.likes.push(userId);
        await post.save();
  
        const notification = new Notification({
          from: userId,
          to: post.user,
          type: "like",
        });
        await notification.save();
  
        return res.status(200).json({ message: "Post liked successfully" });
      }
  
    } catch (error) {
      console.log("ERROR in likeAndUnlikePost:", error);
      res.status(500).json({ message: "Internal server error in like/unlike post" });
    }
  };
  
  const getAllPost = async (req,res) =>{
    try {
        const post = await Post.find().sort({createAt :-1})  // fetch all the for the database 
        if(post.length == 0){
            return res.status(200).json([])
        }
        res.status(200).json(post);
         
    } catch (error) {
        console.log("Error in the getALL posta are", error);
        res.status(500).json({
            message :"Error in the get All Post"
        })
    }
  }
module.exports = { createPost, deletePost, commentPost, likeAndUnlikePost, getAllPost}