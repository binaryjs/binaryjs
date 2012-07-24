var assert = require('assert');
var binaryjs = require('../');
var BinaryServer = binaryjs.BinaryServer;
var BinaryClient = binaryjs.BinaryClient;
var http = require('http');

var server, client, serverUrl = 'ws://localhost:9101';

describe('BinaryServer', function(){
  describe('creating servers', function(){
    it('should allow creating servers with a port', function(){
      server = new BinaryServer({port: 9101});
    });
    it('should allow creating servers with an http server', function(){
      new BinaryServer({port: 9102});
    });
  });
  describe('.clients', function(){
    it('should contain a list of clients', function(done){
      var i = 0;
      var startLength = Object.keys(server.clients).length;
      server.on('connection', function(client){
        assert.equal(server.clients[client.id], client);
        if(++i == 3) {
          var endLength = Object.keys(server.clients).length;
          assert.equal(endLength - startLength, i);
          done();
        }
      });
      new BinaryClient(serverUrl);
      new BinaryClient(serverUrl);
      new BinaryClient(serverUrl);
    });
  });
  describe('.close()', function(){
    it('should prevent future clients connecting', function(done){
      server.close();
      var client = new BinaryClient(serverUrl);
      client.on('error', function(){
        done();
      });
    });
  });
});
