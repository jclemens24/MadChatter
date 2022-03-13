const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});
