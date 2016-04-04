var express = require('express');
var cookieParser = require('cookie-parser');
var events = require('events');
var emitter = new events.EventEmitter();
var session = express.Router();
