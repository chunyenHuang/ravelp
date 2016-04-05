var express = require('express');
var cookieParser = require('cookie-parser');
var database = require('./database.js');
var _ = require('underscore');

var loginStatus = express.Router();
var matchSession = [];

loginStatus.use(cookieParser());
loginStatus.use(function(req, res, next){
  matchSession = [];
  matchSession = _.where(database.sessions, {token: req.cookies.sessionTokenForRavelp});
  if (matchSession.length>0){
    req.matchUser = matchSession[0];
  } else {
    req.matchUser = {
      id: 0
    }
  }
  next();
});

module.exports = loginStatus;
