const cluster = require('cluster');
const http = require('http');
const { setupMaster } = require('@socket.io/sticky');

const WORKERS_COUNT = 4;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < WORKERS_COUNT; i++) {
    cluster.fork();
  }

  cluster.on('exit', worker => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  const httpServer = http.createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection'
  });
  const port = process.env.PORT || 8080;

  httpServer.listen(port, () => {
    console.log(`server listening on ${port}`);
  });
} else {
  console.log(`Worker ${process.pid} started`);
  // eslint-disable-next-line global-require
  require('../app');
}
