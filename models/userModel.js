const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: [2, 'The first name must be at least 2 characters']
    },
    lastName: {
      type: String,
      minlength: [2, 'The last name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      trim: true,
      validate: {
        validator: validator.isEmail,
        message:
          'Email format must match test@example.com. {VALUE} is an invalid email'
      },
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'A password is required'],
      minlength: [8, 'A password must be at least 8 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (pass) {
          return pass === this.password;
        },
        message: 'Passwords must match. Please re-confirm your password'
      }
    },
    profilePic: {
      type: String,
      default: 'default.jpg'
    },
    coverPic: {
      type: String,
      default: 'default.jpg'
    },
    photos: {
      type: [String]
    },
    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      },
      city: {
        type: String
      },
      state: {
        type: String
      }
    },
    birthYear: {
      type: Number
    },
    catchPhrase: {
      type: String,
      minlength: [1, 'A catch phrase must be at least 1 character'],
      maxlength: [150, 'A catch phrase cannot be longer than 150 characters'],
      trim: true,
      default: 'Say Something Clever'
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'toUser',
  localField: '_id'
});

userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'fromUser',
  localField: '_id'
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.statics.verifyPassword = async function (candidatePass, userPass) {
  const result = await bcrypt.compare(candidatePass, userPass);
  return result;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
