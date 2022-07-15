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
const aws = require('aws-sdk');
const User = require('./models/userModel');
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
aws.config.region = 'us-east-1';

const S3_BUCKET = process.env.S3_BUCKET_NAME;

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
app.enable('trust proxy');

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://mad-chatter-app.web.app',
      'https://mad-chatter-app.firebaseapp.com'
    ]
  }
});
// Server Port
const port = process.env.PORT || 8000;
app.options('*', cors());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public', 'images')));

// Global Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(mongoSanitize());
app.use(compression());
// Routes
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);
app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const filename = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: filename,
    Expires: 60,
    contentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, async (err, data) => {
    if (err) {
      console.error(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${filename}`
    };
    await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: returnData.url },
      { new: true }
    );
    res.json({
      url: returnData.url
    });
    res.end();
  });
});
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

  socket.broadcast.emit('userConnected', {
    userId: socket.userId,
    connected: true
  });

  socket.on('privateMessage', ({ content, to, from }) => {
    socket.to(to._id).to(socket.userId).emit('privateMessage', {
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
httpServer.listen(port, () => {
  console.log(`listening on server port ${port}`);
});

module.exports = httpServer;
