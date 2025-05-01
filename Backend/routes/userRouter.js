const express = require('express');
const router = express.Router();
// const {protectedRoute} = require('../controller/user_Controller.js')
const {protectedRoute} =  require('../MiddleWare/protectroute.js')
const  {getUserProfile, followUnfollowUser, getSuggestedUsers,updateUser } =  require('../controller/user_Controller.js')

router.get('/profile/:username', protectedRoute  , getUserProfile);
router.get('/suggested', protectedRoute  , getSuggestedUsers);
router.post('/follow/:id', protectedRoute, followUnfollowUser);
router.post('/update', protectedRoute, updateUser);


module.exports = router