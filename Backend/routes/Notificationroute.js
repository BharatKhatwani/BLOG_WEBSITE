const express = require('express');
const router = express.Router();
const {protectedRoute }= require('../MiddleWare/protectroute.js');
const { getNotification, deleteNotification, deleteNotifications } =  require('../controller/NotificationController.js')


router.get('/get', protectedRoute, getNotification);
router.delete('/delete', protectedRoute, deleteNotification);
router.delete('/delete/:id', protectedRoute, deleteNotifications);


module.exports = router;