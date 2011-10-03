var connect = require('connect');
var externalSass = require('../index');
var http = require('http');
var fs = require('fs');
var testTCP = require('test-tcp');
var nodeunit = require('nodeunit');

module.exports = nodeunit.testCase({
  basic: function(t) {
    testTCP.test_tcp({
      server: connect(externalSass(__dirname + '/fixture')),
      client: function (port, done) {
        http.get({
          host: '127.0.0.1',
          port: port,
          path: '/css/sample1.scss'
        }, function(res) {
          var body = '';
          t.equal(res.statusCode, 200);
          t.equal(res.headers['content-type'], 'text/css');
          res.on('data', function(chunk) { body += chunk; });
          res.on('end', function() {
            t.equal(body, fs.readFileSync(__dirname + '/fixture/out/sample1.css'));
            t.done();
            done();
          });
        });
      }
    });
  }
});
