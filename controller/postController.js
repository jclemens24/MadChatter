const sharp = require('sharp');
const uuid = require('uuid').v4;
const Post = require('../models/postModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ userId: req.user._id });
  if (!posts) return next(new AppError('User has no posts to display', 400));

  res.status(200).json({
    status: 'success',
    posts
  });
});

exports.getAPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const updatePost = await Post.findById(postId);

  res.status(200).json({
    status: 'success',
    post: updatePost
  });
});

exports.resizePostPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const filename = `post-${uuid()}.jpeg`;
  req.file.filename = filename;
  const inputBuffer = req.file.buffer;

  await sharp(inputBuffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/${req.file.filename}`);

  next();
});

exports.createANewPost = catchAsync(async (req, res, next) => {
  const { desc } = req.body;
  let image;
  if (req.file) {
    image = req.file.filename;
  } else {
    image = null;
  }

  const user = await User.findById(req.user._id);
  const newPost = await Post.create({
    userId: user._id,
    desc: desc,
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
    post: post
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
    post: post
  });
});
