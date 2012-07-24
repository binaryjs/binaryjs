var assert = require('assert');
var binaryjs = require('../');
var BinaryServer = binaryjs.BinaryServer;
var BinaryClient = binaryjs.BinaryClient;
var http = require('http');

var server, client, serverUrl = 'ws://localhost:9101';

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
    it('should delete streams upon close event', function(done){
      var closed = 0;
      server.on('connection', function(client){
        client.on('stream', function(stream){
          stream.on('close', function(){
            assert(!(stream.id in client.streams));
            done();
          });
        });
        var stream = client.createStream();
        stream.on('close', function(){
          assert(!(stream.id in client.streams));
        });
        stream.destroy();
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
        var stream = client.createStream();
        stream.destroy();
      });
    });
  });
});

