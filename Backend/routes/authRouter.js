

const express = require('express');
// const app = express();
const router = express.Router();
const  protectroute = require('../MiddleWare/protectroute.js')
const {signup, login, logout, getMe} = require('../controller/authController.js');


router.post('/sign', signup)


router.post('/login', login)
router.get('/getMe',protectroute, getMe);    // protectroute in the middlefunction in which they have been it call the first in it 


router.get('/logout', logout)
module.exports = router;


