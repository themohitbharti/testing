const express = require('express');
const router = express.Router();

const getAllChatsController = require('../controllers/chatController.js').getAllChatsController;


router.get('/getAllChats', getAllChatsController);



module.exports = router;
