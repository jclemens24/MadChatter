const express = require('express');
const conversationController = require('../controller/conversationController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.verifyAuth);
router.route('/').get(conversationController.getConversations);
router.get('/:friendId', conversationController.getASingleConversation);

module.exports = router;
