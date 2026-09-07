const liveStreams = [];

function findAll() {
  return liveStreams;
}

function findById(id) {
  return liveStreams.find((item) => item.id === id);
}

function create(data) {
  const liveStream = { id: Date.now().toString(), ...data };
  liveStreams.push(liveStream);
  return liveStream;
}

module.exports = { findAll, findById, create };
