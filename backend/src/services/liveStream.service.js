const liveStreamRepository = require('../repositories/liveStream.repository');

function getAllLiveStreams() {
  return liveStreamRepository.findAll();
}

function getLiveStreamById(id) {
  return liveStreamRepository.findById(id);
}

function createLiveStream(data) {
  return liveStreamRepository.create(data);
}

module.exports = { getAllLiveStreams, getLiveStreamById, createLiveStream };
