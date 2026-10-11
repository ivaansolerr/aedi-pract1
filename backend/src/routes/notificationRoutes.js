const express = require('express');

const { getAll, markRead } = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAll);
router.patch('/:id/read', authMiddleware, markRead);

module.exports = router;
