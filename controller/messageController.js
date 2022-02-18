const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getChatroomMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ conversationId: req.params.chatId });

  if (!messages) {
    return next(new AppError('Cannot find any messages', 400));
  }
  res.status(200).json({
    status: 'success',
    messages
  });
});

exports.createAMessage = catchAsync(async (req, res, next) => {
  const conversationExists = await Conversation.find({
    _id: req.body.conversationId
  });

  if (conversationExists) {
    const addMessages = await Message.create({
      sender: req.body.senderId,
      text: req.body.text,
      conversationId: req.body.conversationId
    });

    const message = await Message.findOne({ _id: addMessages._id });

    res.status(200).json({
      status: 'success',
      messages: message
    });
  } else {
    const conversation = await Conversation.create({
      members: [req.body.senderId, req.body.recieverId]
    });

    const message = await Message.create({
      sender: req.body.senderId,
      text: req.body.text,
      conversationId: conversation._id
    });

    res.status(200).json({
      status: 'success',
      messages: message
    });
  }
});
