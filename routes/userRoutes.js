const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
  deleteMe,
  getMe,
  uploadPhoto,
  resizeUserPhoto,
  updateMe,
} = require('../controllers/userController');

const authController = require('../controllers/authController');

const router = express.Router();

router.route('/login').post(authController.login);

router.route('/logout').get(authController.logout);

router.route('/signup').post(authController.signUp);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/me', getMe, getUser);

router.patch('/updateMe', uploadPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.patch('/updateMyPassword', authController.updatePassword);

router.use(authController.restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
