const express = require('express');

const {
  getAllUsers,
  getUserById,
  updateRelationship,
  deleteRelationshipHandler
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/:id/relationships', authMiddleware, updateRelationship);
router.delete('/:id/relationships', authMiddleware, deleteRelationshipHandler);

module.exports = router;
