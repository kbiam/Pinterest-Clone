const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  image: {
    type:String
  },
  postText: {
    type: String,
    required: true
  },
  user:{
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: {
    type: Array,
    default: []
  }
});

module.exports  = mongoose.model('Post', postSchema);

