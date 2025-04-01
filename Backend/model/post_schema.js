const mongoose = require('mongoose');


// IT IS USING FOR THE POST OF THE USER 

const postSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true,
    }, 
    text :{
         type : String,

    }, 
    img :{
        type : String,
    }, like :[
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    }
    ]
       , 
comment : [{
   text:{
    type : String,
    require:true
   }, user :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
require : true

   }
}]
}, {timestamps:true})

const post  = mongoose.model('Post', postSchema);
module.exports = post;
