const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('uncaught exception error');

  console.log(err);

  process.exit(1);
});

const app = require('./app');
const dotenv = require('dotenv');
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

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`on Port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection ');

  console.log(err);

  server.close(() => process.exit(1));
});

//Natours App
