const liveStreamService = require('../services/liveStream.service');

function getAll(req, res) {
  res.json(liveStreamService.getAllLiveStreams());
}

function getById(req, res) {
  const liveStream = liveStreamService.getLiveStreamById(req.params.id);
  if (!liveStream) {
    return res.status(404).json({ message: 'Live stream not found' });
  }
  res.json(liveStream);
}

function create(req, res) {
  const liveStream = liveStreamService.createLiveStream(req.body);
  res.status(201).json(liveStream);
}

module.exports = { getAll, getById, create };
