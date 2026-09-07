const { Router } = require('express');
const liveStreamRoutes = require('./liveStream.routes');

const router = Router();

router.use('/live-streams', liveStreamRoutes);

module.exports = router;
