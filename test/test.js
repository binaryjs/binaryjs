var assert = require('assert');
var binaryjs = require('binaryjs');
var BinaryServer = binaryjs.BinaryServer;
var BinaryClient = binaryjs.BinaryClient;
var http = require('http');

var server, serverUrl = 'ws://localhost:9101';

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

describe('BinaryClient', function(){
  beforeEach(function(){
    server = new BinaryServer({port: 9101});
  });
  afterEach(function(){
    server.close();
  });
  describe('events for clients', function(){
    it('should be opennable and closeable', function(done){
      server.on('connection', function(client){
        client.on('close', function(){
          done();
        });
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
        client.close();
      });
    });
    it('should receive streams', function(done){
      server.on('connection', function(client){
        client.on('stream', function(){
          done();
        });
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
      
        client.createStream();
      });
    });
  });
  
  describe('sending data', function(){
    it('should be able to send buffers', function(done){
      var string = 'test';
      server.on('connection', function(client){
        client.on('stream', function(stream){
          stream.on('data', function(data){
            assert.equal(data.toString(), string);
            done();
          });
        });
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
        client.send(new Buffer(string));
      });  
    });
  });
  
  describe('.streams', function(){
    it('should contain a list of streams', function(done){
      server.on('connection', function(client){
        var i = 0;
        var startLength = Object.keys(client.streams).length;
        client.on('stream', function(stream){
          assert.equal(client.streams[stream.id], stream);
          if(++i == 4) {
            var endLength = Object.keys(client.streams).length;
            assert.equal(endLength - startLength, i);
            done();
          }
        });
        var stream = client.createStream();
        assert.equal(client.streams[stream.id], stream);
        i++;
        stream = client.createStream();
        assert.equal(client.streams[stream.id], stream);
        i++;
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
        client.createStream();
        client.createStream();
      });
    });
  });
});