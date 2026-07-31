const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: false
  }
});

redisClient.on('error', (err) => {
  // Only log if we were previously connected, otherwise fail silently in dev
});

let isConnected = false;

const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log('✅ [Redis] Connected successfully');
    } catch (err) {
      console.error('❌ [Redis] Connection failed. Make sure Redis server is running.', err.message);
    }
  }
};

connectRedis();

module.exports = redisClient;
