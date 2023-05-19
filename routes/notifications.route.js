const express = require('express');
const router = express.Router()
const { apiRateLimiter } = require('../middlewares/rateLimitMiddleware')

router
.route('')
.get(apiRateLimiter(10, 25, 20), (req, res) => {
    // Process the request and send notifications
    // ...
    
    res.json({ message: 'Notification sent successfully!!!' });
  });

  module.exports = router;