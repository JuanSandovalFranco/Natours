const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authController');
const {
  getOverview,
  getTour,
  login,
  getAccount,
  updateUserData,
  getMyTours,
  alerts,
} = require('../controllers/viewsController');

const router = express.Router();

router.use(alerts);

router.use(isLoggedIn);

router.get('/', isLoggedIn, getOverview);

router.get('/tour/:slug', isLoggedIn, getTour);

router.get('/login', isLoggedIn, login);

router.get('/me', protect, getAccount);

router.post('/submit-user-data', protect, updateUserData);

router.get('/my-tours', protect, getMyTours);

module.exports = router;
