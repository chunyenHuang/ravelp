var express = require('express');
var cookieParser = require('cookie-parser');
var database = require('./database.js');
var _ = require('underscore');
var session = express.Router();
var matchSession = [];

session.use(cookieParser());
session.use(function(req, res, next){
  matchSession = [];
  matchSession = _.where(database.sessions, {token: req.cookies.sessionTokenForRavelp});
  if (matchSession.length>0){
    req.matchUser = matchSession[0];
    next();
  } else {
    res.sendStatus(404);
  }
});

module.exports = session;
