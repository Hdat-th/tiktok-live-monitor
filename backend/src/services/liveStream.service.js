const { TikTokLiveConnection, WebcastEvent, ControlEvent } = require('tiktok-live-connector');
const liveStreamRepository = require('../repositories/liveStream.repository');

/**
 * Active anonymous connections keyed by TikTok username, so a duplicate
 * connect request reuses the existing socket instead of opening a new one.
 */
const activeConnections = new Map();

/**
 * Opens an anonymous (no login/cookie) connection to a TikTok LIVE room and
 * wires up raw-data extraction for chat messages, gifts, and room user
 * (viewer join / viewer count) events.
 *
 * @param {string} uniqueId TikTok username (without the leading '@')
 * @returns {TikTokLiveConnection}
 */
function connectToLiveStream(uniqueId) {
  if (activeConnections.has(uniqueId)) {
    return activeConnections.get(uniqueId);
  }

  const connection = new TikTokLiveConnection(uniqueId, {
    // No sessionId / cookies provided -> anonymous connection.
    enableExtendedGiftInfo: true,
  });

  registerEventHandlers(connection, uniqueId);

  connection
    .connect()
    .then((state) => {
      console.log(`[${uniqueId}] Connected to roomId ${state.roomId}`);
    })
    .catch((err) => {
      console.error(`[${uniqueId}] Failed to connect:`, err.message);
      activeConnections.delete(uniqueId);
    });

  activeConnections.set(uniqueId, connection);
  return connection;
}

function registerEventHandlers(connection, uniqueId) {
  connection.on(ControlEvent.CONNECTED, (state) => {
    console.log(`[${uniqueId}] connected, roomId=${state.roomId}`);
  });

  connection.on(ControlEvent.DISCONNECTED, () => {
    console.log(`[${uniqueId}] disconnected`);
    activeConnections.delete(uniqueId);
  });

  connection.on(ControlEvent.ERROR, (err) => {
    console.error(`[${uniqueId}] connection error:`, err.message || err);
  });

  // Chat message
  connection.on(WebcastEvent.CHAT, (data) => {
    const chatMessage = extractChatData(uniqueId, data);
    console.log('[CHAT]', chatMessage);
  });

  // Gift sent by a viewer
  connection.on(WebcastEvent.GIFT, (data) => {
    const giftEvent = extractGiftData(uniqueId, data);
    console.log('[GIFT]', giftEvent);
  });

  // Room user update (viewer count / join events)
  connection.on(WebcastEvent.ROOM_USER, (data) => {
    const roomUserEvent = extractRoomUserData(uniqueId, data);
    console.log('[ROOM_USER]', roomUserEvent);
  });
}

function extractChatData(uniqueId, data) {
  return {
    room: uniqueId,
    userId: data.user?.userId,
    username: data.user?.uniqueId,
    nickname: data.user?.nickname,
    comment: data.comment,
    createTime: data.eventTime ?? Date.now(),
  };
}

function extractGiftData(uniqueId, data) {
  return {
    room: uniqueId,
    userId: data.user?.userId,
    username: data.user?.uniqueId,
    nickname: data.user?.nickname,
    giftId: data.giftId,
    giftName: data.gift?.name,
    repeatCount: data.repeatCount,
    repeatEnd: data.repeatEnd,
    diamondCount: data.gift?.diamondCount,
    createTime: data.eventTime ?? Date.now(),
  };
}

function extractRoomUserData(uniqueId, data) {
  return {
    room: uniqueId,
    viewerCount: data.viewerCount,
    createTime: data.eventTime ?? Date.now(),
  };
}

function disconnectFromLiveStream(uniqueId) {
  const connection = activeConnections.get(uniqueId);
  if (!connection) {
    return false;
  }
  connection.disconnect();
  activeConnections.delete(uniqueId);
  return true;
}

function getAllLiveStreams() {
  return liveStreamRepository.findAll();
}

function getLiveStreamById(id) {
  return liveStreamRepository.findById(id);
}

function createLiveStream(data) {
  return liveStreamRepository.create(data);
}

module.exports = {
  getAllLiveStreams,
  getLiveStreamById,
  createLiveStream,
  connectToLiveStream,
  disconnectFromLiveStream,
};
