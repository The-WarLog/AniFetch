var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors'); // 1. Import cors
require('dotenv').config(); // 2. Load environment variables

var animeRouter = require('../routes/animeroutes');

var app = express();

// --- Middleware Setup ---

// 3. Use CORS middleware CORRECTLY before any routes
// This allows your frontend to make requests to the backend.
app.use(cors());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

// API routes are prefixed with /anime
app.use('/anime', animeRouter);

// --- Error Handling ---

// Catch 404 and forward to error handler
// This runs if no route above matched the request
app.use(function(req, res, next) {
  next(createError(404));
});

// General error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error'); // Renders views/error.ejs
});

module.exports = app;
