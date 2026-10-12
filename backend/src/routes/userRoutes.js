const express = require('express');

const {
  getAllUsers,
  getUserById,
  updateProfileHandler,
  updateRelationship,
  deleteRelationshipHandler
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllUsers);
router.put('/me', authMiddleware, updateProfileHandler);
router.get('/:id', getUserById);
router.put('/:id', authMiddleware, updateProfileHandler);
router.post('/:id/relationships', authMiddleware, updateRelationship);
router.delete('/:id/relationships', authMiddleware, deleteRelationshipHandler);

module.exports = router;
