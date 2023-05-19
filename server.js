
const express = require('express');
const cluster = require('cluster');
const os = require('os');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

const { monthlyCounterReset } = require('./middlewares/rateLimitMiddleware')
const notificationsRoutes = require('./routes/notifications.route')

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Notifications API endpoint
app.use("/api/notifications", notificationsRoutes);

// Reset the monthly counter at the beginning of the new month
monthlyCounterReset()

// Start the server
const PORT = process.env.PORT || 3000

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Number of CPUs: ${numCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}

module.exports = app


