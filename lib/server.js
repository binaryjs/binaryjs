var ws = require('streamws');
var events = require('events');
var util = require('./util');

var BinaryClient = require('./client');

function BinaryServer(options) {
  if (!(this instanceof BinaryServer)) return new BinaryServer(options);

  var self = this;
  
  this.server  = new ws.Server(options);
  this.server.on('connection', function(socket){
    var binaryClient = new BinaryClient(socket);
    self.emit('connection', binaryClient);
  });
  this.server.on('error', function(error){
    self.emit('error', error);
  });
}

util.inherits(BinaryServer, events.EventEmitter);

BinaryServer.prototype.close = function(code, message){
  this.server.close(code, message);
}

exports.BinaryServer = BinaryServer;