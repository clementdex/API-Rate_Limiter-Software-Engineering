const cron = require('node-cron');
const redisClient = require('../redis')


// Middleware to enforce rate limiting
module.exports.apiRateLimiter = (maxRequestsPerSecond, maxRequestsPerMonth, systemMaxRequestsPerSecond) => (req, res, next) => {
  const clientID = req.headers['x-client-id']; // Assuming client ID is sent in the request headers

  // Incrementing the per-second request count using Redis' atomic increment operation
  redisClient.incr(`rateLimit:${clientID}:second`, (err, currentRequestsPerSecond) => {
    if (err) {
      console.error('Error incrementing rate limit:', err);
      return res.sendStatus(500);
    }

    console.log('time window', currentRequestsPerSecond)
    if (currentRequestsPerSecond > maxRequestsPerSecond) {
      return res.status(429).json({ error: 'Too many requests per second' });
    }

    // Expire the per-second count after 1 second
    redisClient.expire(`rateLimit:${clientID}:second`, 1);

    // Increment the per-month request count using Redis' atomic increment operation
    redisClient.incr(`rateLimit:${clientID}:month`, (err, currentRequestsPerMonth) => {
      if (err) {
        console.error('Error incrementing rate limit:', err);
        return res.sendStatus(500);
      }

      console.log('monthly', currentRequestsPerMonth)
      if (currentRequestsPerMonth > maxRequestsPerMonth) {
        return res.status(429).json({ error: 'Too many requests per month' });
      }

      // Expire the per-month count after 5 second just for testing
      redisClient.expire(`rateLimit:${clientID}:month`, 5);

      // Increment the system's per-second request count using Redis' atomic increment operation
      redisClient.incr('rateLimit:system:second', (err, currentSystemRequestsPerSecond) => {
        if (err) {
          console.error('Error incrementing system rate limit:', err);
          return res.sendStatus(500);
        }

        console.log('system', currentSystemRequestsPerSecond)
        if (currentSystemRequestsPerSecond > systemMaxRequestsPerSecond) {
          return res.status(503).json({ error: 'Service unavailable' });
        }

        // Expire the system's per-second count after 1 second
        redisClient.expire('rateLimit:system:second', 3);

        next();
      });
    });
  });
}

// Reset per-month counters at the beginning of each month
module.exports.monthlyCounterReset = () => {
  cron.schedule('0 0 1 * *', () => {
    redisClient.keys('rateLimit:*:month', (err, keys) => {
      if (err) {
        console.error('Error retrieving rate limit keys:', err);
        return;
      }
  
      keys.forEach((key) => {
        redisClient.set(key, 0);
      });
    });
  });

} 

// module.exports.rateLimiter = (timeWindow, requestsLimit) => async (req, res, next) => {
//   const ip = req.connection.remoteAddress

//   const [response] = await redisClient
//   .multi()
//   .incr(ip)
//   .expire(ip, timeWindow)
//   .exec();

//   let currentRequests = response[1]
//   console.log(currentRequests);

//   if (currentRequests > requestsLimit) {
//     return res.status(429).json({ error: 'Too many requests per second' });
//   }
//   else next();
// }