const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const connectdb = require('./database/db.js');
const authRoute = require('./routes/authRouter.js');
const userRoute = require('./routes/userRouter.js'); // Fixed path
const postRoute = require('./routes/postrouter.js')
const  NotificationRoute = require('./routes/Notificationroute.js')

dotenv.config(); // Call dotenv before using environment variables

const app = express();
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to database
connectdb();

// Routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute); // Add user route (optional if used)
app.use('/api/post', postRoute); 
app.use('/api/notification', NotificationRoute);

app.get('/hey', (req, res) => {
  res.send('hey');
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
