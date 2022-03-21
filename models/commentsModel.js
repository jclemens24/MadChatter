const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'A comment must belong to a post']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A comment must belong to a user']
    },
    comment: {
      type: String,
      required: [true, 'A comment must exist'],
      minlength: [3, 'A comment must be at least 3 characters'],
      maxlength: [1000, 'A comment cannot be longer than 1000 characters'],
      trim: true
    },
    reactions: {
      thumbsUp: {
        type: Number,
        default: 0
      },
      heart: {
        type: Number,
        default: 0
      },
      rocket: {
        type: Number,
        default: 0
      },
      eyes: {
        type: Number,
        default: 0
      },
      lol: {
        type: Number,
        default: 0
      },
      hooray: {
        type: Number,
        default: 0
      },
      angryFace: {
        type: Number,
        default: 0
      },
      sadFace: {
        type: Number,
        default: 0
      }
    }
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

commentSchema.pre(/find/, function (next) {
  this.populate({
    path: 'user',
    select:
      '-__v -location -email -coverPic -followers -following -birthYear -photos -catchPhrase'
  });
  next();
});

commentSchema.post('save', (doc, next) => {
  doc
    .populate({
      path: 'user',
      select:
        '-__v -location -email -coverPic -followers -following -birthYear -photos -catchPhrase'
    })
    .then(() => {
      next();
    });
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
