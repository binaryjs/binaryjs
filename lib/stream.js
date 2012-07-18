// if node
var Stream = require('stream').Stream;
var util = require('./util');
// end node

function BinaryStream(socket, id, create, meta) {
  if (!(this instanceof BinaryStream)) return new BinaryStream(options);
  
  var self = this;
  
  Stream.call(this);

  
  this.id = id;
  this._socket = socket;
  this._socket.addEventListener('error', function(error){
    self.readable = false;
    self.writable = false;
    self.emit('error', error);
  });
  this._socket.addEventListener('close', function(code, message){
    self.readable = false;
    self.writable = false;
    self.emit('close', code, message);
  });
  
  // if node
  this._socket._sender._socket.on('drain', function(){
    if(!self.paused) {
      self.emit('drain');
    }
  });
  // end node
  
  this.writable = true;
  this.readable = true;
  this.paused = false;
  
  this._ended = false;
  
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
  this.paused = true;
};

BinaryStream.prototype._onResume = function() {
  // Emit resume event
  this.emit('resume');
  this.emit('drain');
  this.paused = false;
};

BinaryStream.prototype._write = function(code, data, bonus, cb) {
  var message = util.pack([code, data, bonus]);
  return this._socket.send(message, {binary: true}, cb) !== false;
};

BinaryStream.prototype.write = function(data, cb) {
  if(this.writable) {
    var out = this._write(2, data, this.id, cb);
    return !this.paused && out;
  } else {
    throw new Error('Stream is not writable');
  }
};

BinaryStream.prototype.end = function() {
  this._onEnd();
  this._write(5, null, this.id);
};

BinaryStream.prototype.destroy = BinaryStream.prototype.destroySoon = function() {
  this._onClose();
  this._write(6, null, this.id);
};


// Read stream

BinaryStream.prototype._onEnd = function() {
  if(this._ended) return;
  
  this._ended = true;
  this.readable = false;
  this.emit('end');
};

BinaryStream.prototype._onData = function(data) {
  // Dispatch 
  if(this.readable) {
    this.emit('data', data);
  }
};

BinaryStream.prototype.pause = function() {
  this._onPause();
  this._write(3, null, this.id);
};

BinaryStream.prototype.resume = function() {
  this._onResume();
  this._write(4, null, this.id);
};

// if node
exports.BinaryStream = BinaryStream;
// end node
