// if node
var Stream = require('stream').Stream;
var EventEmitter = require('events').EventEmitter;

var util = require('./util');
var BinaryStream = require('./stream');
// end node

function BinaryClient(socket) {
  if (!(this instanceof BinaryClient)) return new BinaryClient(options);
  
  var self = this;
  
  
  this._streams = {};
  
  // Use even numbered ids for client orignated streams
  this._nextId = 0;
  
  // if node
  // Use odd numbered ids for server originated streams
  this._nextId = 1;
  // end node
  
  if(typeof socket === 'string') {
    this._socket = new WebSocket(socket);
  } else {
    this._socket = socket;
  }

  this._socket.addEventHandler('error', function(error){
    self.emit('error', error);
  });
  this._socket.addEventHandler('close', function(code, message){
    self.emit('close', code, message);
  });
  this._socket.addEventHandler('message', function(data, flags){
    // Message format
    // [type, payload, bonus ]
    //
    // Reserved
    // [ 0  , X , X ]
    // 
    //
    // New stream
    // [ 1  , Meta , new streamId ]
    // 
    //
    // Data
    // [ 2  , Data , streamId ]
    // 
    //
    // Pause
    // [ 3  , null , streamId ]
    // 
    //
    // Resume
    // [ 4  , null , streamId ]
    // 
    //
    // End
    // [ 5  , null , streamId ]
    // 
    //
    // Close
    // [ 6  , null , streamId ]
    // 
    
    if(data instanceof MessageEvent){
      data = data.data;
    }
    
    data = util.unpack(data);
    
    switch(data[0]) {
      case 0:
        // Reserved
        break;
      case 1:
        var meta = data[1];
        var streamId = data[2];
        var binaryStream = self._receiveStream(streamId);
        self.emit('stream', meta);
        break;
      case 2:
        var data = data[1];
        var streamId = data[2];
        var binaryStream = self._streams[streamId];
        if(binaryStream) {
          binaryStream._onData(data);
        } else {
          self.emit('error', 'Received `data` message for unknown stream: ' + streamId);
        }
        break;
      case 3:
        var streamId = data[2];
        var binaryStream = self._streams[streamId];
        if(binaryStream) {
          binaryStream._onPause();
        } else {
          self.emit('error', 'Received `pause` message for unknown stream: ' + streamId);
        }
        break;
      case 4:
        var streamId = data[2];
        var binaryStream = self._streams[streamId];
        if(binaryStream) {
          binaryStream._onResume();
        } else {
          self.emit('error', 'Received `resume` message for unknown stream: ' + streamId);
        }
        break;
      case 5:
        var streamId = data[2];
        var binaryStream = self._streams[streamId];
        if(binaryStream) {
          binaryStream._onEnd();
        } else {
          self.emit('error', 'Received `end` message for unknown stream: ' + streamId);
        }
        break;
      case 6:
        var streamId = data[2];
        var binaryStream = self._streams[streamId];
        if(binaryStream) {
          binaryStream._onClose();
          delete self._streams[streamId];
        } else {
          self.emit('error', 'Received `close` message for unknown stream: ' + streamId);
        }
        break;
      default:
        self.emit('error', 'Unrecognized message type received: ' + data[0]);
    }
    
  });
}

util.inherits(BinaryClient, EventEmitter);

BinaryClient.prototype.send = function(data, meta){
  if(data instanceof Stream) {
    data.pipe(this.createStream(meta));
  } else {
    var stream = this.createStream(meta);
    // Do chunking
  }
};

BinaryClient.prototype._receiveStream = function(streamId){
  var binaryStream = new BinaryStream(this._socket, streamId, false);
  this._streams[streamId] = binaryStream;
  return binaryStream;
};

BinaryClient.prototype.createStream = function(meta){
  var streamId = this._nextId;
  this._nextId += 2;
  var binaryStream = new BinaryStream(this._socket, streamId, true, meta);
  this._streams[streamId] = binaryStream;
  return binaryStream;
};

BinaryClient.prototype.close = BinaryClient.prototype.destroy = function(code, message) {
  this._socket.close(code, message);
};


// if node
module.exports = BinaryClient;
// end node