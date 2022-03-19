const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must be sent to a user']
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must be sent from a user']
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
        type: mongoose.Schema.Types.ObjectId,
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
    path: 'toUser',
    select:
      '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location',
    options: { _recursed: true }
  }).populate({
    path: 'fromUser',
    select:
      '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location'
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
      path: 'toUser fromUser',
      select:
        '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location',
      options: { _recursed: true }
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
