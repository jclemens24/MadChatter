const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const getCoordsForAddress = require('../utils/location');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const coordinates = await getCoordsForAddress(
    `${req.body.city} ${req.body.state}, ${req.body.zip}`
  );

  if (!coordinates)
    return next(new AppError('Unable to retrieve coordinates', 404));
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    location: {
      coordinates: [coordinates.lng, coordinates.lat],
      city: req.body.city,
      state: req.body.state
    },
    birthYear: req.body.birthYear
  });

  const posts = await Post.find({ toUser: newUser._id });

  const token = signToken(newUser._id);
  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    user: newUser,
    posts,
    token
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError('Please provide your login email and password', 404)
    );
  }

  const user = await User.findOne({ email: email })
    .select('+password')
    .populate({
      path: 'following',
      select:
        '-__v -birthYear -catchPhrase -email -following -followers -coverPic -location -photos'
    });
  // eslint-disable-next-line no-console
  console.log(user instanceof User);

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(
      new AppError(
        'Incorrect credentials. Please check your credentials and try again',
        401
      )
    );
  }
  const posts = await Post.find({ toUser: user._id }).populate({
    path: 'comments'
  });

  const token = signToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    user,
    token,
    posts
  });
});

exports.verifyAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access Forbidden. Please login.', 401));
  }

  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const authorizedUser = await User.findById(decodedJWT.id);
  if (!authorizedUser) {
    return next(
      new AppError('User belonging to this token does not exist', 401)
    );
  }

  req.user = authorizedUser;
  res.locals.user = authorizedUser;
  next();
});
