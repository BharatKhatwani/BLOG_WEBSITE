const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;
const authRouter = require('./routes/authRouter.js');
const userRouter = require('./routes/userRouter.js');
const db = require('./database/db.js');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const postrouter = require('./routes/postrouter.js');


const app = express();
app.use(express.json());  // for req.body
app.use(cookieParser());  // for req.cookies

db.connectDb();
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key  : process.env.CLOUDINARY_API_KEY,
    api_secret  : process.env.CLOUDINARY_API_SECRET
})

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/post', postrouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
