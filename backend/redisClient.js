const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff, max 3 seconds
      const delay = Math.min(retries * 100, 3000);
      return delay;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('❌ [Redis] Client Error:', err.message);
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
