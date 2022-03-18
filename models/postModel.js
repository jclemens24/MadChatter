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
    select:
      '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase'
  });
  next();
});

postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
});

postSchema.post('save', (doc, next) => {
  doc
    .populate({
      path: 'userId',
      select:
        '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase'
    })
    .then(() => {
      next();
    });
});

postSchema.post(/^create/, function (next) {
  this.populate({
    path: 'comments',
    options: {
      _recursed: true
    }
  });
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
