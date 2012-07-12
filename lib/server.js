var ws = require('streamws');
var events = require('events');
var util = require('./util');

var BinaryStream = require('./stream');
var BinaryUser = require('./user');

function BinaryServer(options) {
  if (!(this instanceof BinaryServer)) return new BinaryServer(options);

  var self = this;
  
  this.server  = new ws.Server(options);
  this.server.on('connection', function(client){
    var stream = new BinaryStream(client);
    self.emit('connection', stream);
  });
  this.server.on('error', function(){
    self.emit('error', error);
  });
}

util.inherits(BinaryServer, events.EventEmitter);

BinaryServer.prototype.close = function(){
  var args = Array.prototype.slice.apply(arguments);
  this.server.close.apply(this.server, args);
}

exports.BinaryServer = BinaryServer;