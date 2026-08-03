const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../redisClient');

// Helper function to create a new RedisStore with a unique prefix
const createRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: prefix
  });
};

// Protect authentication endpoints (login, register)
// Very strict: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:auth:'),
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Protect OTP endpoints (verify, resend)
// 5 requests per 10 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:otp:'),
  message: { error: 'Too many OTP requests, please try again later.' }
});

// Protect generic public APIs (home, feed, family details)
// 100 requests per 1 minute per IP
const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:public:'),
  message: { error: 'Too many requests to public APIs, please slow down.' }
});

// Protect domain onboarding endpoints
// 20 requests per hour per IP to prevent spamming
const domainOnboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:onboarding:'),
  message: { error: 'Too many domain onboardings, please try again later.' }
});

module.exports = {
  authLimiter,
  otpLimiter,
  publicApiLimiter,
  domainOnboardingLimiter
};
