// if node
var Stream = require('stream').Stream;
var EventEmitter = require('events').EventEmitter;
var BufferReadStream = require('streamers').BufferReadStream;

var util = require('./util');
var BinaryStream = require('./stream').BinaryStream;

// end node

function BinaryClient(socket, options) {
  if (!(this instanceof BinaryClient)) return new BinaryClient(options);
  
  EventEmitter.call(this);
  
  var self = this;
  
  this._options = util.extend({
    chunkSize: 40960
  }, options);
  
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
  
  this._socket.binaryType = 'arraybuffer';
  
  this._socket.addEventListener('open', function(){
    self.emit('open');
  });
  this._socket.addEventListener('error', function(error){
    self.emit('error', error);
  });
  this._socket.addEventListener('close', function(code, message){
    self.emit('close', code, message);
  });
  this._socket.addEventListener('message', function(data, flags){
    util.setZeroTimeout(function(){
  
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
      
      if(data.hasOwnProperty('data')){
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
          self.emit('stream', binaryStream, meta);
          break;
        case 2:
          var payload = data[1];
          var streamId = data[2];
          var binaryStream = self._streams[streamId];
          if(binaryStream) {
            binaryStream._onData(payload);
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
  });
}

util.inherits(BinaryClient, EventEmitter);

BinaryClient.prototype.send = function(data, meta){
  var stream = this.createStream(meta);
  if(data instanceof Stream) {
    data.pipe(stream);
  } else if (util.isNode === true) {
    if(Buffer.isBuffer(data)) {
      (new BufferReadStream(data, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else {
      stream.write(data);
    } 
  } else if (util.isNode !== true) {
    if(data.constructor == window.Blob) {
      (new BlobReadStream(data, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else if (data.constructor == window.ArrayBuffer) {
      var blob;
      if(binaryFeatures.useArrayBufferView) {
        data = new Uint8Array(data.buffer);
      }
      if(binaryFeatures.useBlobBuilder) {
        var builder = new BlobBuilder();
        builder.append(data);
        blob = builder.getBlob()
      } else {
        blob = new Blob([data]);
      }
      (new BlobReadStream(blob, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else if (typeof data === 'object' && 'BYTES_PER_ELEMENT' in data) {
      var blob;
      if(!binaryFeatures.useArrayBufferView) {
        // Warn
        data = data.buffer;
      }
      if(binaryFeatures.useBlobBuilder) {
        var builder = new BlobBuilder();
        builder.append(data);
        blob = builder.getBlob()
      } else {
        blob = new Blob([data]);
      }
      (new BlobReadStream(blob, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else {
      stream.write(data);
    }
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


exports.BinaryClient = BinaryClient;
