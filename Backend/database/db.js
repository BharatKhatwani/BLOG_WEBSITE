const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDb = async (req,res) =>{
    try {
        // const connect = await 
        await mongoose.connect(process.env.MongoURL);
        console.log('MongoDB connected');
  
    } catch (error) {
        console.log(error);
       process.exit(1);
    }
}
module.exports = {connectDb};