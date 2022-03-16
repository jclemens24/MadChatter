const express = require('express');
const authController = require('../controller/authController');
const postController = require('../controller/postController');
const commentController = require('../controller/commentController');
const upload = require('../middleware/fileUpload');
const commentRouter = require('./commentRoute');

const router = express.Router();

router.use('/:postId/comments', commentRouter);

router.use(authController.verifyAuth);
router.put('/:postId/like', postController.likeAPost);
router.put('/:postId/dislike', postController.dislikeAPost);
router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    upload.single('image'),
    postController.resizePostPhoto,
    postController.createANewPost
  );

router
  .route('/:postId')
  .delete(postController.deleteOnePost, commentController.deleteComments)
  .get(postController.getOnePost);
module.exports = router;
