const Conversation = require('../models/conversationModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getConversations = catchAsync(async (req, res, next) => {
  const userConversations = await Conversation.find({}).where(
    'members',
    req.user._id
  );

  if (!userConversations) {
    return next(new AppError('You have no saved conversations', 400));
  }

  res.status(200).json({
    status: 'success',
    conversations: userConversations
  });
});

exports.getASingleConversation = catchAsync(async (req, res, next) => {
  const { friendId } = req.params;
  const conversation = await Conversation.findOne({
    members: { $all: [req.user._id, friendId] }
  });

  res.status(200).json({
    status: 'success',
    conversations: conversation
  });
});
