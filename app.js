const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError.js');
const golbalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

//Start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Global middleware
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//security HTTP header limit request
app.use(helmet());

//1) Devlopment login morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limiter
const limiter = rateLimit({
  max: 100, //100 request form same ip
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP, please try in one hour!',
});
app.use('/api', limiter);

// Body parser reading data from body req.body by express
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against to noSQL query injection
app.use(mongoSanitize());

// Data sanitization against to XSS
app.use(xss());

// For parameter polution
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

// Test middleware (3)
app.use((req, res, next) => {
  req.requsetTime = new Date().toISOString();
  //console.log(req.cookies.jwt);
  next();
});

//Router
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//in last if nothing found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

//error handler of express
app.use(golbalErrorHandler);

module.exports = app;
