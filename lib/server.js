var ws = require('streamws');
var EventEmitter = require('events').EventEmitter;
var util = require('./util');

var BinaryClient = require('./client').BinaryClient;

function BinaryServer(options) {
  if (!(this instanceof BinaryServer)) return new BinaryServer(options);

  var self = this;

  options = util.extend({
    host: '0.0.0.0',
    chunkSize: 40960
  }, options);

  this.clients = {};
  this._clientCounter = 0;

  
  if (options.server && (options.server instanceof ws.Server)) {
    this._server  = options.server;
  } else {
    this._server  = new ws.Server(options);
  }
  
  this._server.on('connection', function(socket){
    var clientId = self._clientCounter;
    var binaryClient = new BinaryClient(socket, options);
    binaryClient.id = clientId;
    self.clients[clientId] = binaryClient;
    self._clientCounter++;
    binaryClient.on('close', function(){
      delete self.clients[clientId];
    });
    self.emit('connection', binaryClient);
  });
  this._server.on('error', function(error){
    self.emit('error', error);
  });
}

util.inherits(BinaryServer, EventEmitter);

BinaryServer.prototype.close = function(code, message){
  this._server.close(code, message);
}

exports.BinaryClient = BinaryClient;
exports.BinaryServer = BinaryServer;

// Expose a method similar to http.createServer
//
// usage:
//  var fs = require('fs');
//  require('binaryjs').createServer(function(c) {
//    fs.createReadStream('some.bin').pipe(c);
//  });
//
exports.createServer = function(fn) {
  var server;

  return {
    listen : function(port, opts) {
      opts = opts || {};
      opts.port = port;

      var server = new BinaryServer(opts);
      server.on('connection', function(conn) {
        fn && fn(conn.createStream());
      });

      return server;
    }
  }
};
