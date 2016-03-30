var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var _ = require('underscore');
var cookieParser = require('cookie-parser');
var port = 3000;
var app = express();

app.use(express.static('./public/assets'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
})

app.listen(port, function(){
  console.log('listening to port: ' + port);
})
