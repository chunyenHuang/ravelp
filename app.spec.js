var chai = require('chai');
var assert = chai.assert;
var request = require('request');
var port = 1337;

describe('Route Test', function () {
  it('get: /', function (done) {
    request({method: 'get', url:'http://localhost:1337/'}, function(err, res, body) {
      assert.equal(res.statusCode, 200);
      done();
    })
  })
  it('get: /guest', function (done) {
    request({method: 'get', url:'http://localhost:1337/guest'}, function(err, res, body) {
      assert.equal(res.statusCode, 200);
      done();
    })
  })
});
