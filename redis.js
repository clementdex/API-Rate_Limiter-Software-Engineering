const Redis = require('ioredis')

// Use the default configurations such as host: localhost and port: 6379 which can be changed.
const redisClient = new Redis()

module.exports = redisClient