const express = require('express');
const messageController = require('../controller/messageController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.verifyAuth);
router.get('/:chatId', messageController.getChatroomMessages);
router.post('/', messageController.createAMessage);

module.exports = router;
