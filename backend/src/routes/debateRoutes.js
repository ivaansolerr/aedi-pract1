const express = require('express');

const {
  getAll,
  getOne,
  createComment,
  subscribe,
  update,
  remove,
  deleteCommentHandler
} = require('../controllers/debateController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);
router.post('/:id/comments', authMiddleware, createComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteCommentHandler);
router.post('/:id/subscribe', authMiddleware, subscribe);

module.exports = router;
