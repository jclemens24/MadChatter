const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({}).populate({ path: 'comments' });

  res.status(200).json({
    status: 'success',
    posts
  });
});

exports.getPostByUser = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ toUser: req.params.userId }).populate({
    path: 'comments'
  });

  if (!posts)
    return next(
      new AppError(
        'Could not find that post or you must login to access these posts',
        401
      )
    );

  res.status(200).json({
    status: 'success',
    posts
  });
});

exports.getOnePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId).populate({
    path: 'comments'
  });

  if (!post) return next(new AppError('There is no post by that Id', 404));

  res.status(200).json({
    status: 'success',
    post
  });
});

exports.createANewPost = catchAsync(async (req, res, next) => {
  let image;
  if (req.file) {
    image = `${req.file.location}`;
  } else {
    image = null;
  }

  const newPost = await Post.create({
    toUser: req.body.to,
    fromUser: req.body.from,
    desc: req.body.desc,
    image: image
  });

  res.status(200).json({
    status: 'success',
    post: newPost
  });
});

exports.likeAPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const checkPostLiked = await Post.findById(postId).where(
    'likes',
    req.user._id
  );

  if (checkPostLiked)
    return next(new AppError('You already have liked this post', 400));

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $push: { likes: req.user._id }
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    post: post,
    user: req.user._id
  });
});

exports.dislikeAPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $pull: { likes: { $in: [req.user._id] } }
    },
    { returnDocument: 'after' }
  );

  res.status(200).json({
    status: 'success',
    post: post,
    user: req.user._id
  });
});

exports.deleteOnePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findByIdAndDelete(postId);

  if (!post) return next(new AppError('There is no post by that ID', 404));

  next();
});

exports.getAFriendsPosts = catchAsync(async (req, res, next) => {
  const friendPost = await Post.find({ toUser: req.friend._id }).populate({
    path: 'comments'
  });

  if (!friendPost)
    return next(
      new AppError(
        'Could not find any posts by this user. Please try your request again',
        404
      )
    );

  res.status(200).json({
    status: 'success',
    user: req.friend,
    posts: friendPost
  });
});
