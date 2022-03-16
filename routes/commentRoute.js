const express = require('express');
const authController = require('../controller/authController');
const commentController = require('../controller/commentController');

const router = express.Router({ mergeParams: true });

router.use(authController.verifyAuth);

router
  .route('/')
  .post(commentController.setPostUserId, commentController.createAComment)
  .get(commentController.getAllComments);
module.exports = router;
