const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    desc: {
      type: String,
      maxlength: 500
    },
    image: {
      type: String,
      default: null
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: [],
        unique: false
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: '-__v -passwordConfirm'
  }).populate({
    path: 'likes'
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
