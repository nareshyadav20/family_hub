const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

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
