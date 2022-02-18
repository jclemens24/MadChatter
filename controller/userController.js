const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate('posts')
    .populate('followers')
    .populate('following');
  if (!user) return next(new AppError('User could not be found', 404));

  res.status(200).json({
    status: 'success',
    user
  });
});

exports.unfollowAndFollowAFriend = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const userFriend = req.body.id;

  if (!userId || !userFriend)
    return next(new AppError('Request could not be completed', 404));

  if (req.query.unfollow === '1') {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: { following: userFriend }
      },
      { new: true }
    )
      .populate('following')
      .populate('posts');

    res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  } else if (req.query.unfollow === '0') {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: { following: userFriend }
      },
      { new: true }
    )
      .populate('following')
      .populate('posts');

    res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  }
});

exports.getAUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError('User could not be found', 400));
  }

  const friend = await User.findById(userId)
    .populate('followers following')
    .populate('posts');

  if (!friend) {
    return next(new AppError('Could not find this profile', 400));
  }

  res.status(200).json({
    status: 'success',
    user: friend
  });
});

exports.suggestFriends = catchAsync(async (req, res, next) => {
  const { lnglat } = req.params;
  const [lng, lat] = lnglat.split(',');
  const multiplier = 0.0006213712;
  const nearbyUsers = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        maxDistance: 5000
      }
    },
    {
      $project: {
        distance: true,
        firstName: true,
        lastName: true,
        profilePic: true
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    users: nearbyUsers
  });
});
