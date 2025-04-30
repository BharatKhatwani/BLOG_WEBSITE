const express = require('express');
const router = express.Router();
const Post  = require('../model/post_schema')
const {protectedRoute }= require('../MiddleWare/protectroute.js')
const {createPost, deletePost , commentPost, likeAndUnlikePost, getAllPost} = require('../controller/postController.js')


router.post('/create', protectedRoute ,createPost );
router.post('/like/:id', protectedRoute ,likeAndUnlikePost);
router.post('/comment/:id', protectedRoute ,commentPost);
router.delete('/delete/:id', protectedRoute, deletePost)
router.get('/getAll', protectedRoute,getAllPost );


module.exports = router;