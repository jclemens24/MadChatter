const Comment = require('../models/commentsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setPostUserId = (req, res, next) => {
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllComments = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const comment = await Comment.find({ post: postId });

  res.status(200).json({
    status: 'success',
    comments: comment
  });
});

exports.createAComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.create(req.body);

  if (!comment)
    return next(
      new AppError(
        'Error creating the comment. Please try your request again',
        404
      )
    );

  res.status(201).json({
    status: 'success',
    comment
  });
});

exports.deleteComments = catchAsync(async (req, res, next) => {
  const comment = await Comment.deleteMany({ post: req.params.postId });

  if (!comment)
    return next(new AppError('No associated comments with this post'), 404);
  res.status(204).json({
    status: 'success'
  });
});
