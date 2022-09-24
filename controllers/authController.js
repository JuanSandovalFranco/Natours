const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jsonwebtoken = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const Email = require('../utils/email');

const signToken = (id) => {
  return jsonwebtoken.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwared-proto'] === 'https',
  };

  res.cookie('JWT', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(user, url).sendWelcome();

  createSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('please provide email and password '), 400);
  }

  const user = await User.findOne({ email }).select('+password');

  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('email or password invalid'), 401);
  }

  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('JWT', 'looged out'),
    {
      expiresIn: new Date(Date.now() * 10 * 1000),
      httpOnly: true,
    };
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  const { authorization } = req.headers;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }

  if (!token) {
    return next(new AppError('you must have log in', 401));
  }

  const decoded = await promisify(jsonwebtoken.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('the user with this token does no exist', 401));
  }

  if (currentUser.changedPassword(decoded.iat)) {
    next(new AppError('the user password changed please log in', 401));
  }

  req.user = currentUser;

  res.locals.user = currentUser;

  next();
});

//only for render pages , no errors
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.JWT) {
      token = req.cookies.JWT;

      const decoded = await promisify(jsonwebtoken.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;

      return next();
    }

    return next();
  } catch (error) {
    return next();
  }
};

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('you do not have a permission for this action'),
        403
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('the user with this email not exist'), 404);
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('there was error sending de email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;

  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;

  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 201, req, res);
});

exports.updatePassword = async (req, res, next) => {
  const user = User.findById(req.user.id).select('+password');

  const correctPassword = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!correctPassword) {
    next(new AppError('the password is invalid', 401));
  }

  user.password = req.body.password;

  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 201, req, res);
};
