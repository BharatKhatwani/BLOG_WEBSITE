const express = require('express');
const router = express.Router();
const protectroute  = require('../MiddleWare/protectroute');
// const { createPost } = require("../controller/postController.js"); // ✅ Fixed path
const {createPost , deletePost,commentPost } = require('../controller/postController')

router.post('/create', protectroute, createPost); // ✅ Correct function usage

// router.post('/like/:id', protectroute, likeunlikepost);
router.post('/comment/:id', protectroute, commentPost);
router.delete('/delete/:id', protectroute, deletePost);

module.exports = router;
