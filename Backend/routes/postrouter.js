const express = require('express');
const router = express.Router();
const protectroute  = require('../MiddleWare/protectroute');
// const { createPost } = require("../controller/postController.js"); // ✅ Fixed path
const {createPost , deletePost,commentPost , likeUnlikePost, getAllPost, getLikedPost, getFollowingPost} = require('../controller/postController')



router.get('/all', protectroute, getAllPost); 
router.get('/following', protectroute, getFollowingPost);
router.get('/likes/:id', protectroute, getLikedPost);
router.post('/create', protectroute, createPost); // ✅ Correct function usage

router.post('/like/:id', protectroute, likeUnlikePost);
router.post('/comment/:id', protectroute, commentPost);
router.delete('/delete/:id', protectroute, deletePost);



module.exports = router;
