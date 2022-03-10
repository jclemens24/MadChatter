const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');
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
  );

router.patch('/photos/:pid', userController.deleteUserPhoto);

router
  .route('/:userId/friends')
  .patch(userController.unfollowAndFollowAFriend)
  .get(userController.getAUserProfile);

module.exports = router;
