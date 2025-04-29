// routes/authRouter.js
const express = require('express');
const router = express.Router();
const {login , logout, signup, getMe} = require('../controller/authController.js')
const protectedRoute = require('../controller/authController.js')

router.post('/get', protectedRoute ,getMe );

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);


module.exports = router; // ✅ Important
