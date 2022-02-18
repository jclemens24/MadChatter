const express = require('express');
const authController = require('../controller/authController');
const postController = require('../controller/postController');
const upload = require('../middleware/fileUpload');

const router = express.Router();

router.use(authController.verifyAuth);
router.put('/:postId/like', postController.likeAPost);
router.put('/:postId/dislike', postController.dislikeAPost);
router
  .route('/')
  .get(postController.getUserPosts)
  .post(
    upload.single('image'),
    postController.resizePostPhoto,
    postController.createANewPost
  );

module.exports = router;
