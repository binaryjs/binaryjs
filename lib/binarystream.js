var Stream = require('stream').Stream;
var util = require('./util');


function BinaryStream(client) {
  if (!(this instanceof BinaryStream)) return new BinaryStream(options);
  
  var self = this;
  
  Stream.call(this);
  
  this.on('pipe', this._onPipe);
  
  this._client = client;
  this._client.on('error', function(error){
    self.readable = false;
    self.writeable = false;
    self.emit('error', error);
  });
  this._client.on('close', function(code, message){
    self.readable = false;
    self.writeable = false;
    self.emit('close', code, message);
  });
  this._client.on('message', function(data, flags){
    self.emit('data', data, flags);
  });
  
  this.writable = true;
  this.readable = true;
  this._paused = false;
}

util.inherits(BinaryStream, Stream);


// Write stream
BinaryStream.prototype._onPipe = function(src) {
  var self =  this;
  var onDrain = function(){
    self.emit('drain');
  };
  var doEnd = function(){
    self._client._sender._socket.removeListener('drain', onDrain);
  };
  this._client._sender._socket.on('drain', onDrain);
  
  src.on('end', doEnd);
  src.on('error', doEnd);
  src.on('close', doEnd);
}

BinaryStream.prototype.write = function(data, cb) {
  var out = this._client.send(data, {binary: true}, cb);
  return out;
};


BinaryStream.prototype.end = function() {
  this._client.close();
};

BinaryStream.prototype.destroySoon = function() {
  this._client.close();
};

BinaryStream.prototype.destroy = function() {
  this.readable = false;
  this.writeable = false;
  this._client.terminate();
};

// Read stream
BinaryStream.prototype.pause = function() {
  this._paused = true;
  this._client.pause();
};


BinaryStream.prototype.resume = function() {
  this._paused = false;
  this._client.resume();
};

module.exports = BinaryStream;
