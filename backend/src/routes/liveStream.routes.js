const { Router } = require('express');
const liveStreamController = require('../controllers/liveStream.controller');

const router = Router();

router.get('/', liveStreamController.getAll);
router.get('/:id', liveStreamController.getById);
router.post('/', liveStreamController.create);

module.exports = router;
