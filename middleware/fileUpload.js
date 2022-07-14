const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const uuidv4 = require('uuid').v4;
const multerS3 = require('multer-s3');
// const AppError = require('../utils/appError');

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// const multerMemory = multer.memoryStorage();

// const multerFilter = (req, file, er) => {
//   if (file.mimetype.startsWith('image')) {
//     er(null, true);
//   } else {
//     er(new AppError('You may only upload images', 400), false);
//   }
// };

// const upload = multer({
//   storage: multerMemory,
//   fileFilter: multerFilter
// });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'madchatter-images',
    cacheControl: 'max-age=31536000',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `${uuidv4()}.jpg`);
    }
  })
});

module.exports = upload;
