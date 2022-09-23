const User = require('../models/userModel');
const AppError = require('./errorController');
const factory = require('./handlerController');

const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');

/* const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  },
}); */

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image Please upload only images', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filter = (body, ...user) => {
  let object = {};

  Object.keys(body).map((el) => {
    if (user.includes(el)) object[el] = body[el];
  });

  return object;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.getUser = factory.getOne(User);

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'this route does not allow update password please change the password in the route / updatePassword thanks',
        400
      )
    );
  }

  const filterBody = filter(req.body, 'name', 'email');

  if (req.file) filterBody.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
    },
  });
};

exports.deleteMe = async (req, res, next) => {
  const user = User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
