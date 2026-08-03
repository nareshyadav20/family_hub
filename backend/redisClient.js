const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.warn('❌ [Redis] Max connection retries reached. Redis cache is disabled.');
        return new Error('Max retries reached'); // Stops further reconnect attempts
      }
      return Math.min(retries * 100, 3000);
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
