// connectDb.js
const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MongoURL);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1); // optional: to stop the app if connection fails
    }
}

module.exports = connectDb;
