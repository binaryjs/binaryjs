var Stream = require('stream').Stream;
var util = require('./util');


function BinaryStream(client, id, create, meta) {
  if (!(this instanceof BinaryStream)) return new BinaryStream(options);
  
  var self = this;
  
  Stream.call(this);
  
  this.id = id;
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
  
  this._client._sender._socket.on('drain', function(){
    self.emit('drain');
  });
  
  this.writable = true;
  this.readable = true;
  this._paused = false;
  
  if(create) {
    // This is a stream we are creating
    this._write(1, meta, this.id);
  }
}

util.inherits(BinaryStream, Stream);

BinaryStream.prototype._onClose = function() {
  // Emit close event
  this.readable = false;
  this.writable = false;
  this.emit('close');
};



// Write stream

BinaryStream.prototype._onPause = function() {
  // Emit pause event
  this.emit('pause');
  this._paused = true;
};

BinaryStream.prototype._onResume = function() {
  // Emit resume event
  this.emit('resume');
  this._paused = false;
};

BinaryStream.prototype._write = function(code, data, bonus, cb) {
  return this._client.send([code, data, bonus], {binary: true}, cb);
};

BinaryStream.prototype.write = function(data, cb) {
  if(this.writable) {
    var out = this._write(2, data, this.id, cb);
    return !this._paused && out;
  } else {
    throw new Error('Stream is not writable');
  }
};

BinaryStream.prototype.end = function() {
  this.readable = false;
  this._write(5, null, this.id);
};

BinaryStream.prototype.destroy = BinaryStream.prototype.destroySoon = function() {
  this.readable = false;
  this.writable = false;
  this._write(6, null, this.id);
};


// Read stream

BinaryStream.prototype._onEnd = function() {
  this.readable = false;
  this.emit('end');
};

BinaryStream.prototype._onData = function(data) {
  // Dispatch data
  if(this.readable) {
    this.emit(data);
  }
};

BinaryStream.prototype.pause = function() {
  this._paused = true;
  this._write(3, null, this.id);
};

BinaryStream.prototype.resume = function() {
  this._paused = false;
  this._write(4, null, this.id);
};

module.exports = BinaryStream;
