const post_schema = require('../model/post_schema.js');
const { User } = require('../model/User_Model.js');
const cloudinary = require('cloudinary').v2;
const Notification = require('../model/notification_schema.js'); // Added missing import
const Post = require('../model/post_schema.js'); // Added consistent import for Post

const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Please enter text or image" });
    }

    let imageUrl = "";
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      imageUrl = uploadResponse.secure_url; // Fixed: Use imageUrl instead of reassigning img
    }

    const newPost = new post_schema({
      user: userId,
      text,
      img: imageUrl, // Fixed: Use imageUrl
    });

    await newPost.save();

    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await post_schema.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(req.user._id.toString());
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (post.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "You are not the owner of this post" });
    }

    if (post.img) {
      const imageId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await post_schema.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = { user: userId, text };
    post.comment.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId); // Fixed: Use Post instead of post_schema
    console.log(post)
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // console.log(post.likes.includes(userId))
    const userLikedPost = post.likes.includes(userId);
   
    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPost = async (req, res) => {
  try {
    const posts = await post_schema
      .find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getLikedPost = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // Fixed: Use Post
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 2: Get the list of following user IDs
    const followingUsers = user.following;

    // Step 3: Get posts where post.user is in followingUsers array
    const posts = await Post.find({ user: { $in: followingUsers } })
      .sort({ createdAt: -1 }) // newest first
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getFollowingPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createPost, deletePost, commentPost, likeUnlikePost, getAllPost, getLikedPost , getFollowingPost};