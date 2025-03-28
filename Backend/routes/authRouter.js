

const express = require('express');
// const app = express();
const router = express.Router();
const {signup, login, logout} = require('../controller/authController.js');


router.get('/sign', signup)


router.get('/login', login)


router.get('/logout', logout)
module.exports = router;


