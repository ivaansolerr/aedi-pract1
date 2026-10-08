const express = require('express');

const { create, getAll, getOne } = require('../controllers/workController');

const router = express.Router();

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getOne);

module.exports = router;
