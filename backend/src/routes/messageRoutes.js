const express = require('express');

const {
  create,
  getChat,
  getActiveConversations,
  markRead
} = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, create);
router.get('/conversations', authMiddleware, getActiveConversations);
router.get('/:targetUserId', authMiddleware, getChat);
router.patch('/:id/read', authMiddleware, markRead);

module.exports = router;
