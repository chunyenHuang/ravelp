var express = require('express');
var cookieParser = require('cookie-parser');
var session = express.Router();

var sessions =[];
var matchSession = [];
function Session(token, id){
  this.token = token;
  this.id = id;
}
session.use(cookieParser());
session.use(function(req, res, next){
  matchSession = [];
  matchSession = _.where(sessions, {token: req.cookies.sessionTokenForRavelp});
  if (matchSession.length>0){
    next();
  } else {
    res.sendFile(__dirname + '/public/index.html');
  }
});

module.exports = session();
