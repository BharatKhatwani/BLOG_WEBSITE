const express = require('express');
const User = require('../model/User_Model');
const Post = require('../model/post_schema');
const { v2: cloudinary } = require('cloudinary');
const Notification = require('../model/notification_schema');

// Configure Cloudinary (  ensure this is done in your app setup or here with environment variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPost = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!text && !img) {
            return res.status(400).json({ error: "Post must have text or image" });
        }

        if (text && text.length > 500) {
            return res.status(400).json({ error: "Text must be less than 500 characters" });
        }

        let imgPublicId = null;
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
            imgPublicId = uploadedResponse.public_id;
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
            imgPublicId,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log("Error in createPost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deletePost = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        if (post.imgPublicId) {
            await cloudinary.uploader.destroy(post.imgPublicId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in deletePost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const commentOnPost = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        if (text.length > 500) {
            return res.status(400).json({ error: "Comment must be less than 500 characters" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();

        // Create notification for post owner
        if (post.user.toString() !== userId.toString()) {
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "comment",
            });
            await notification.save();
        }

        res.status(200).json(post);
    } catch (error) {
        console.log("Error in commentOnPost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const likeUnlikePost = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.user._id;
        const { id: postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            // Unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            const updatedPost = await Post.findById(postId);
            res.status(200).json({ message: "Post unliked successfully", likes: updatedPost.likes });
        } else {
            // Like post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            if (post.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    from: userId,
                    to: post.user,
                    type: "like",
                });
                await notification.save();
            }

            res.status(200).json({ message: "Post liked successfully", likes: post.likes });
        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in getLikedPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getFollowingPosts = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const following = user.following;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error in getFollowingPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    createPost,
    deletePost,
    commentOnPost,
    likeUnlikePost,
    getAllPosts,
    getLikedPosts,
    getFollowingPosts,
    getUserPosts,
};