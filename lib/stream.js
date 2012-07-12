var Stream = require('stream').Stream;
var util = require('./util');


function BinaryStream(client) {
  if (!(this instanceof BinaryStream)) return new BinaryStream(options);
  
  var self = this;
  
  Stream.call(this);
  
  this._client = client;
  this._client.on('error', function(error){
    self.readable = false;
    self.writable = false;
    self.emit('error', error);
  });
  this._client.on('close', function(code, message){
    self.readable = false;
    self.writable = false;
    self.emit('close', code, message);
  });
  this._client.on('message', function(data, flags){
    if(self.readable) {
      self.emit('data', data, flags);
    }
  });
  
  this._client._sender._socket.on('drain', function(){
    self.emit('drain');
  });
  
  this.writable = true;
  this.readable = true;
  this._paused = false;
}

util.inherits(BinaryStream, Stream);

BinaryStream.prototype.write = function(data, cb) {
  if(this.writable) {
    var out = this._client.send(data, {binary: true}, cb);
    return out;
  } else {
    throw new Error('Stream is not writable');
  }
};


BinaryStream.prototype.end = function() {
  this._client.readable = false;
  this._client.close();
};

BinaryStream.prototype.destroySoon = function() {
  this.readable = false;
  this.writable = false;
  this._client.close();
};

BinaryStream.prototype.destroy = function() {
  this.readable = false;
  this.writable = false;
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
