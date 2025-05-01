const express = require('express');
const Notification = require('../model/notification_schema.js');

const getNotification = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.user._id;
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg",
        });

        await Notification.updateMany({ to: userId }, { read: true });

        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in getNotification controller: ", error);
        return res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

const deleteNotification = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notificationId = req.params.id;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (req.user._id.toString() !== notification.to.toString()) {
            return res.status(403).json({ error: "You cannot delete this notification" });
        }

        await Notification.findByIdAndDelete(notificationId);

        res.status(200).json({ message: "Notification successfully deleted" });
    } catch (error) {
        console.log("Error in deleteNotification controller: ", error);
        return res.status(500).json({ error: "Failed to delete notification" });
    }
};


// const Notification = require('../model/notification_schema.js');

const deleteNotifications = async (req, res) => {
    try {
        // Validate req.user
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notificationId = req.params.id;
        const userId = req.user._id;

        // Find the notification
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        // Check if the user is the owner (recipient) of the notification
        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this notification" });
        }

        // Delete the notification
        await Notification.findByIdAndDelete(notificationId);

        return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.log("Error in deleteNotification controller: ", error);
        return res.status(500).json({ error: "Failed to delete notification" });
    }
};

// module.exports = { deleteNotification };

module.exports = { getNotification, deleteNotification, deleteNotifications };