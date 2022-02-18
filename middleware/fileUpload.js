const multer = require('multer');
const AppError = require('../utils/appError');

const multerMemory = multer.memoryStorage();

const multerFilter = (req, file, er) => {
  if (file.mimetype.startsWith('image')) {
    er(null, true);
  } else {
    er(new AppError('You may only upload images', 400), false);
  }
};

const upload = multer({
  storage: multerMemory,
  fileFilter: multerFilter
});

module.exports = upload;
