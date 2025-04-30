const express = require('express');
const router = express.Router();
// const {protectedRoute} = require('../controller/user_Controller.js')
const {protectedRoute} =  require('../MiddleWare/protectroute.js')
const {getUserProfile,followUnFollower , getSuggestedUser, updateUserProfile} =  require('../controller/user_Controller.js')

router.get('/profile/:username', protectedRoute  , getUserProfile);
router.get('/suggested', protectedRoute  , getSuggestedUser );
router.post('/follow/:id', protectedRoute, followUnFollower);
router.post('/update', protectedRoute, updateUserProfile);

module.exports = router