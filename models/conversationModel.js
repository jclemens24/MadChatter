const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true
    },
    toObject: {
      virtuals: true
    }
  }
);

conversationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'members',
    select: '-__v -passwordConfirm -following -followers'
  });
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
