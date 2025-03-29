

const express  = require('express')
const router = express.Router();
const protectroute  = require("../MiddleWare/protectroute");
const {getUserProfile , followUnfollowUser, getSuggestedUser, Updateuser } = require('../controller/user_Controller')
router.get('/profile/:username', protectroute, getUserProfile);
router.get("/suggested",protectroute, getSuggestedUser);
router.post("/follow/:id",protectroute, followUnfollowUser);
router.post("/update", protectroute, Updateuser);

module.exports = router;