const express = require('express');

const { create, getAll, getOne, update, remove } = require('../controllers/workController');
const { createForWork } = require('../controllers/debateController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);
router.post('/:workId/debates', authMiddleware, createForWork);

module.exports = router;
