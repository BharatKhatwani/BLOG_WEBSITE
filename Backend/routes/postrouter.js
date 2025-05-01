const express = require('express');
const router = express.Router();
const Post  = require('../model/post_schema')
const {protectedRoute }= require('../MiddleWare/protectroute.js')
const {createPost, deletePost, commentOnPost,likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts} = require('../controller/postController.js')


router.post('/create', protectedRoute ,createPost );
router.get('/likes/:id', protectedRoute, getLikedPosts);
router.post('/like/:id', protectedRoute ,likeUnlikePost);
router.post('/comment/:id', protectedRoute ,commentOnPost);
router.delete('/delete/:id', protectedRoute, deletePost)
router.get('/getAll', protectedRoute,getAllPosts );
router.get('/following', protectedRoute, getFollowingPosts);
router.get("/user/:username", protectedRoute, getUserPosts);


module.exports = router;