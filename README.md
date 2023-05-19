# API-Rate_Limiter-Software-Engineering

# API Rate Limiter with Redis [ an open source (BSD licensed), fast in-memory data structure store, used as an in-memory key–value database, cache, and message broker. ]

This repository contains code for implementing rate limiting with Redis in a Node.js application. The rate limiting is based on the number of requests per second and per month for each client, as well as the maximum requests per second for the entire system.

## Prerequisites

Before running the application, ensure you have the following prerequisites installed on your machine:

- Node.js (version 16.14.2)
- Redis server (ioredis v5.3.2) and running

## Getting Started

1. Clone the repository:

   ```shell
   git clone https://github.com/clementdex/API-Rate_Limiter-Software-Engineering.git

2. Install dependencies:

   ```shell
   cd API-Rate_Limiter-Software-Engineering
   npm install

3. Start the Redis server:

   If you have Redis installed locally, simply run the following command:

  ```shell
  redis-server

If you're using a remote Redis server, update the Redis connection configuration in redis.js to point to the correct host and port.

4. Configure the application:

Go to routes Open notifications.routes.js and adjust the following parameters to the apiRateLimiter middleware function passed to the notifications API endpoint according to your requirements:

	1. maxRequestsPerSecond: Maximum requests allowed per second for each client.
	2. maxRequestsPerMonth: Maximum requests allowed per month for each client.
	3. systemMaxRequestsPerSecond: Maximum requests allowed per second for the entire system.

5. Start the application:
   nodemon server.js or npm start
The application will start running on http://localhost:3000

Usage
-----

To test the rate-limiting functionality, you can send HTTP requests to the /api/notifications endpoint.
full endpoint: http://localhost:3000/api/notifications

Include the client ID in the request headers:
x-client-id: <client-id>

If the rate limits are exceeded, the API will respond with an appropriate error status code and message.


Testing
-------

You can run automated tests to verify the rate-limiting functionality.

	1. Make sure the Redis server is running.
	2. Run the tests:
	npm test

The tests will validate the rate-limiting behavior for different scenarios, such as exceeding the maximum requests per second and per month.


Further Scaling the Application
--------------------------------

If you want to scale the application across multiple servers, use a cluster of Node.js processes. The code below includes cluster support for utilizing multiple CPU cores.

	1. Update the code:

In server.js, remove or comment out the following code block:

// Start the server
const PORT = process.env.PORT || 3000

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;

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

Make sure to adjust the server port if needed.

	2. Start multiple instances:

Run the following command for each server instance:
node server.js

Each instance will listen on a different port, allowing to distribute the load among multiple servers.


Contributing
-------------

Contributions are welcome! If you find any issues or want to enhance the functionality, feel free to submit a pull request.

Please make sure to follow the existing code style and include tests for any new features or bug fixes.

License
--------

This project is licensed under the MIT License.
