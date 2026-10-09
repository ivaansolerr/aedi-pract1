const express = require('express');

const { getAll, getOne, createComment } = require('../controllers/debateController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/:id/comments', authMiddleware, createComment);

module.exports = router;
