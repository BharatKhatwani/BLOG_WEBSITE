const mongoose = require('mongoose');

// IT IS USING FOR THE POST OF THE USER 
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
  },
  img: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: [],
    },
  ],
  comment: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
  ],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
