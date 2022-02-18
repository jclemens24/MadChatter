const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation',
      required: [true, 'A message must belong to a conversation']
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A message must belong to a user']
    },
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'A message cannot be longer than 500 characters']
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

messageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'conversationId',
    select: 'members'
  }).populate({
    path: 'sender',
    select: '-__v -passwordConfirm'
  });
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
