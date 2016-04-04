var express = require('express');
var cookieParser = require('cookie-parser');
var database = require('./database.js');
var _ = require('underscore');
var authorization = express.Router();
var matchSession = [];
authorization.use(cookieParser());
authorization.use(function(req, res, next){
  matchSession = [];
  matchSession = _.where(database.sessions, {token: req.cookies.sessionTokenForRavelp});
  if (matchSession.length>0){
    req.matchUser = matchSession[0];
    next();
  } else {
    res.redirect('/guest');
  }
});

module.exports = authorization;
