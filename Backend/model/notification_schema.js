// const mongoose = require('mongose');
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  from :{
  type : mongoose.Schema.Types.ObjectId,
  ref : 'User',
  required : true
  }, 
  to :{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required : true
  }, 
  type :{
    type : string, 
    required : true,
    enum : ['follow ', 'like']
  }, read :{
    type : Boolean , 
    default : false
  }
},  {timeseries: true})

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification