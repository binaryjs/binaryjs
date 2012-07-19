var ws = require('streamws');
var EventEmitter = require('events').EventEmitter;
var util = require('./util');

var BinaryClient = require('./client').BinaryClient;

function BinaryServer(options) {
  if (!(this instanceof BinaryServer)) return new BinaryServer(options);

  var self = this;
  
  options = util.extend({
    host: '0.0.0.0'
  }, options);
  
  this.server  = new ws.Server(options);
  this.server.on('connection', function(socket){
    var binaryClient = new BinaryClient(socket);
    self.emit('connection', binaryClient);
  });
  this.server.on('error', function(error){
    self.emit('error', error);
  });
}

util.inherits(BinaryServer, EventEmitter);

BinaryServer.prototype.close = function(code, message){
  this.server.close(code, message);
}

exports.BinaryServer = BinaryServer;