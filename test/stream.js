var assert = require('assert');
var binaryjs = require('../');
var BinaryServer = binaryjs.BinaryServer;
var BinaryClient = binaryjs.BinaryClient;
var http = require('http');

var server, client, serverUrl = 'ws://localhost:9101';

describe('BinaryStream', function(){
  beforeEach(function(){
    server = new BinaryServer({port: 9101});
  });
  afterEach(function(){
    server.close();
  });
  describe('Messaging', function(){
    it('should send and receive messages', function(done){
      server.on('connection', function(client){
        client.on('stream', function(stream){
          stream.on('data', function(){
            done();
          });
          stream.write('hi');
        });
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
        var stream = client.createStream();
        stream.on('data', function(){
          stream.write('bye');
        });
      }); 
    });
    it('should send and receive pause, resume, and end', function(done){
      server.on('connection', function(client){
        client.on('stream', function(stream){
          stream.on('pause', function(){
            assert(stream.paused);
          });
          stream.resume();
          stream.on('resume', function(){
            assert(!stream.paused);
          });
          stream.on('end', function(){
            assert(!stream.readable);
            done();
          });
        });
      });
      var client = new BinaryClient(serverUrl);
      client.on('open', function(){
        var stream = client.createStream();
        stream.pause();
        stream.on('pause', function(){
          assert(stream.paused);
        });
        stream.on('resume', function(){
          assert(!stream.paused);
          stream.end();
        });
        stream.on('end', function(){
          assert(!stream.readable);
        });
      }); 
    });
  });
});
