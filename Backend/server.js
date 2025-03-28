const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;
const authRouter = require('./routes/authRouter');
const db = require('./database/db.js')

const app = express();
app.use(express.json());
db.connectDb();

app.use('/api/auth', authRouter);


app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`);
})