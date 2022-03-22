const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const userRouter = require('./routes/userRoute');
const postRouter = require('./routes/postRoute');
const conversationRouter = require('./routes/conversationRoute');
const messageRouter = require('./routes/messageRoute');
const commentRouter = require('./routes/commentRoute');
const errorController = require('./controller/errorController');
const AppError = require('./utils/appError');
const { InMemorySessionStore } = require('./store/sessionStore');

const sessionStore = new InMemorySessionStore();
dotenv.config({ path: './config.env' });

// Database Connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    autoIndex: false
  })
  .then(() => console.log('Database Connected Successfully'))
  .catch(err => console.log(err));

// Initialize App
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://mad-chatter-app.web.app',
      'https://mad-chatter-app.firebaseapp.com'
    ],
    allowedHeaders: ['Authorization'],
    credentials: true
  }
});
app.enable('trust proxy');
app.options('*', cors());
app.use(cors());
// Server Port
const port = 8000 || process.env.PORT;
app.use(mongoSanitize());
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public', 'images')));

// Global Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Routes
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);
// Error Middleware
app.use(errorController);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

io.use((socket, next) => {
  const sessionId = socket.handshake.auth._id;
  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userId = session.userId;
      socket._id = session.userId;
      socket.username = session.username;
      return next();
    }
  }
  socket.sessionId = socket.handshake.auth._id;
  socket.userId = socket.handshake.auth.userId;
  socket.username = socket.handshake.auth.username;
  socket._id = socket.handshake.auth._id;
  if (!sessionId)
    return next(new AppError('Trouble connecting. Please reload.', 400));
  next();
});

io.on('connection', async socket => {
  sessionStore.saveSession(socket.sessionId, {
    userId: socket.userId,
    username: socket.username,
    connected: true
  });

  socket.emit('session', {
    sessionId: socket.sessionId,
    userId: socket.userId
  });

  socket.join(socket.userId);

  const users = [];

  sessionStore.findAllSessions().forEach(session => {
    users.push({
      userId: session.userId,
      username: session.username,
      connected: session.connected
    });
  });

  socket.emit('users', users);

  socket.broadcast.emit('user connected', {
    userId: socket.userId,
    connected: true
  });

  socket.on('private message', ({ content, to, from }) => {
    socket.to(to._id).to(socket.userId).emit('private message', {
      content,
      to,
      from
    });
  });

  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.userId).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      socket.broadcast.emit('user disconnected', socket.userId);

      sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        username: socket.username,
        connected: false
      });
    }
  });
});

// Server Listening
httpServer.listen(port, 'localhost', () => {
  console.log(`listening on server port ${port}`);
});

module.exports = httpServer;
