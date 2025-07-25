var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

// The path needs to go up one level from /api to find /routes
var animeRouter = require('../routes/animeroutes'); 

var app = express();

// Middleware
app.use(cors()); // Allows your frontend to call the API
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Routes
app.use('/anime', animeRouter);

// Error Handling
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// Export the app for Vercel to use
module.exports = app;