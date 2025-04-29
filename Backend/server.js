const express = require('express');

const dotenv = require('dotenv')
const app = express();
const connectdb = require('./database/db.js')
const authRoute = require('./routes/authRouter.js');
const cookieParser = require('cookie-parser');

require('dotenv').config();

app.use(express.json());
// for the token in which they have been there in which we are using so we are using the cookies Parser as the middleware in it 
app.use(cookieParser());
connectdb();
  app.use('/api/auth', authRoute);
  app.get('/hey', (req,res) =>{
    res.send('hey')
  })

const PORT = process.env.PORT|| 8000;
  app.listen(PORT, () =>{
    console.log(`THE SERVER IS RUNNING ON THE ${PORT}`)
  })
  