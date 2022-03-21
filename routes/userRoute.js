const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');
const postController = require('../controller/postController');
const upload = require('../middleware/fileUpload');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.use(authController.verifyAuth);
router.get('/', userController.validateAUser);
router.get('/:lnglat', userController.suggestFriends);
router
  .route('/:userId/photos')
  .get(userController.getUserPhotos)
  .put(userController.setUserPhoto)
  .post(
    upload.single('image'),
    userController.resizeUserPhoto,
    userController.uploadUserPhoto
  )
  .patch(
    upload.single('image'),
    userController.resizeUserCoverPhoto,
    userController.uploadCoverPhoto
  );

router
  .route('/photos/:pid')
  .patch(userController.deleteUserPhoto)
  .put(userController.setUserCoverPhoto);

router.route('/:userId/friends').patch(userController.unfollowAndFollowAFriend);

router.get(
  '/:userId/profile/friends',
  userController.getAUserProfile,
  postController.getAFriendsPosts
);

module.exports = router;
