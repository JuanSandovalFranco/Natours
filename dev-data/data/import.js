const fs = require('fs');
const mongoose = require('mongoose');
const app = require('../../app');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((conexion) => {
    console.log('DB connection succesfull');
  });

const tours = JSON.parse(fs.readFileSync(__dirname + '/tours.json', 'utf-8'));

const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));

const review = JSON.parse(
  fs.readFileSync(__dirname + '/reviews.json', 'utf-8')
);

const importData = async () => {
  await Tour.create(tours);
  // await User.create(users, { validateBeforeSave: false });
  // await Review.create(review);

  console.log('breve');
};

if (process.argv[2] === '--import') {
  importData();
}
