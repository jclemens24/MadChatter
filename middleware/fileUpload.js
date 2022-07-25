const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const uuidv4 = require('uuid').v4;
const multerS3 = require('multer-s3');
const sharp = require('sharp');
const AppError = require('../utils/appError');

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'madchatter-images',
    cacheControl: 'max-age=31536000',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `${uuidv4()}.jpg`);
    }
  }),
  fileFilter(req, file, callback) {
    const filetypes = /jpeg|jpg|png/;
    const mimetypes = filetypes.test(file.mimetype);
    if (mimetypes) {
      sharp(file).resize(500, 500, 'cover').toFormat('jpg');
      return callback(null, true);
    }
    return callback(new AppError('You may only upload images', 404), false);
  },
  limits: { fileSize: 1024 * 1024 * 50 }
});

module.exports = upload;
