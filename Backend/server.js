const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;
const authRouter = require('./routes/authRouter.js');
const userRouter = require('./routes/userRouter.js');
const db = require('./database/db.js');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());  // for req.body
app.use(cookieParser());  // for req.cookies

db.connectDb();

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
