const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const userRouter = require('./routes/userRoute');
const postRouter = require('./routes/postRoute');
const conversationRouter = require('./routes/conversationRoute');
const messageRouter = require('./routes/messageRoute');
const errorController = require('./controller/errorController');
const AppError = require('./utils/appError');

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
    origin: 'http://localhost:3000',
    allowedHeaders: ['Authorization'],
    credentials: true
  }
});

app.options('*', cors());
app.use(cors());
// Server Port
const port = 8000 || process.env.PORT;

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
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);
// Error Middleware
app.use(errorController);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

const users = [];
console.log(users);

const addUser = (userId, socketId) => {
  const exists = users.some(user => user.userId === userId);
  if (exists) return;
  users.push({ userId, socketId });
};

// const removeUser = socketId => {
//   users.filter(user => user.socketId !== socketId);
// };

const getUser = userId => {
  return users.find(user => user.userId === userId);
};

io.on('connection', socket => {
  console.log('a user is connected');
  socket.on('addUser', user => {
    console.log(user);
    addUser(user._id, socket.id);
    console.log(users);
  });

  socket.on('sendMessage', ({ sender, reciever, text }) => {
    const user = getUser(reciever._id);
    socket.to(user.socketId).emit('postMessage', {
      sender,
      text
    });
  });
});

// Server Listening
httpServer.listen(port, 'localhost', () => {
  console.log(`listening on server port ${port}`);
});

module.exports = httpServer;
