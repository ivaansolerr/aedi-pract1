const express = require('express');

const { create, getAll, getOne } = require('../controllers/workController');
const { createForWork } = require('../controllers/debateController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/:workId/debates', authMiddleware, createForWork);

module.exports = router;
