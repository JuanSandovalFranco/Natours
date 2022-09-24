const path = require('path');
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const globalError = require('./controllers/errorController');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const compression = require('compression');
const cors = require('cors');

//Start express application
const app = express();

app.enable('trust proxy');

///Middleware

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(cors());

app.options('*', cors());

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request',
});

app.use('/api', limiter);

app.use(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection

app.use(mongoSanitize());

//Data sanitization against XSS

app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//controllers

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', (req, res) => {});

app.use(compression());

// Router
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalError);

module.exports = app;
