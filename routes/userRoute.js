const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.use(authController.verifyAuth);
router.get('/', userController.getAUser);
router.get('/:lnglat', userController.suggestFriends);

router
  .route('/:userId/friends')
  .patch(userController.unfollowAndFollowAFriend)
  .get(userController.getAUserProfile);

module.exports = router;
