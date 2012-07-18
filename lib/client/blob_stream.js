function BlobReadStream(source, options){
  Stream.call(this);
  
  options = util.extend({
      readDelay: 0,
      paused: false
  }, options);
  
  this._source = source;
  this._start = 0;
  this._readChunkSize = options.chunkSize || source.size;
  this._readDelay = options.readDelay;
  
  this.readable = true;
  this.paused = options.paused;
  
  this._read();
}

util.inherits(BlobReadStream, Stream);


BlobReadStream.prototype.pause = function(){
  this.paused = true;
};

BlobReadStream.prototype.resume = function(){
  this.paused = false;
  this._read();
};

BlobReadStream.prototype.destroy = function(){
  this.readable = false;
  clearTimeout(this._timeoutId);
};

BlobReadStream.prototype._read = function(){
    
  var self = this;
  
  function emitReadChunk(){
    self._emitReadChunk();
  }
  
  var readDelay = this._readDelay;
  if (readDelay !== 0){
    this._timeoutId = setTimeout(emitReadChunk, readDelay);
  } else {
    util.setZeroTimeout(emitReadChunk);
  }
    
};

BlobReadStream.prototype._emitReadChunk = function(){
    
  if(this.paused || !this.readable) return;
  
  var chunkSize = Math.min(this._source.size - this._start, this._readChunkSize);
  
  if(chunkSize === 0){
      this.readable = false;
      this.emit("end");
      return;
  }
  
  var sourceEnd = this._start + chunkSize;
  var chunk = (this._source.slice || this._source.webkitSlice || this._source.mozSlice).call(this._source, this._start, sourceEnd);
  
  this._start = sourceEnd;
  this._read();
  
  this.emit("data", chunk);
  
};

/*




function BlobWriteStream(options){
    
    stream.Stream.call(this);
    
    options = _.extend({
        onFull: onFull,
        onEnd: function(){},
        minBlockAllocSize: 0,
        drainDelay:0
    }, options);
    
    this._onFull = options.onFull;
    this._onEnd = options.onEnd;
    this._onWrite = options.onWrite;
    
    this._minBlockAllocSize = options.minBlockAllocSize;
    this._maxBlockAllocSize = options.maxBlockAllocSize;
    this._drainDelay = options.drainDelay;
    
    this._buffer = new Buffer(options.minBlockAllocSize);
    this._destination = this._buffer;
    this._destinationPos = 0;
    
    this._writeQueue = [];
    this._pendingOnFull = false;
    this._pendingQueueDrain = false;
    
    this.writable = true;
    this.bytesWritten = 0;
}

util.inherits(BlobWriteStream, stream.Stream);

BlobWriteStream.prototype.getBuffer = function(){
    return this._buffer;
};

BlobWriteStream.prototype.write = function(data, encoding){
    
    if(!this.writable){
        throw new Error("stream is not writable");
    }
    
    if(!Buffer.isBuffer(data)){
        data = new Buffer(data, encoding);
    }
    
    if(data.length){
        this._writeQueue.push(data);
    }
    
    this._commit();
    
    return this._writeQueue.length === 0;
};

BlobWriteStream.prototype._commit = function(){
    
    var self = this;
    
    var destination = this._destination;
    var writeQueue = this._writeQueue;
    
    var startDestinationPos = this._destinationPos;
    
    while(writeQueue.length && destination.length){
        
        var head = writeQueue[0];
        
        var copySize = Math.min(destination.length, head.length);
        
        head.copy(destination, 0, 0, copySize);
        
        head = head.slice(copySize);
        destination = destination.slice(copySize);
        
        this.bytesWritten += copySize;
        this._destinationPos += copySize;
        
        if(head.length === 0){
            writeQueue.shift();
        }
        else{
            writeQueue[0] = head;
        }
    }
    
    this._destination = destination;
    
    bytesCommitted = this._destinationPos - startDestinationPos;
    if(bytesCommitted){
        if(this._onWrite){
            
            if(writeQueue.length){
                this._pendingQueueDrain = true;
            }
            
            // By locking destination the buffer is frozen and the onWrite
            // callback cannot miss any write commits
            this._destination = emptyBuffer;
            
            var consumer = this._onWrite;
            this._onWrite = null;
            
            consumer.call(this, function(nextCallback){
                util.setZeroTimeout(function(){
                    self._destination = destination;
                    self._onWrite = nextCallback;
                    self._commit();
                });
            }, consumer);
            
            return;
        }
    }
    
    if(writeQueue.length){
        
        this._pendingQueueDrain = true;
        this._growBuffer();
    }
    else if(this._pendingQueueDrain){
        
        this._pendingQueueDrain = false;
        
        if(this._drainDelay !== 0){
            setTimeout(function(){
                self.emit("drain");
            }, this._drainDelay);
        }
        else{
            util.setZeroTimeout(function(){
                self.emit("drain");
            });
        }
    }
};

BlobWriteStream.prototype._growBuffer = function(){
    
    var self = this;
    var writeQueue = this._writeQueue;
    
    var requestSize = this._minBlockAllocSize;
    
    var maxBlockAllocSize = this._maxBlockAllocSize;
    var add = (maxBlockAllocSize === undefined ? function(a, b){return a + b;} : function(a, b){return Math.min(a + b, maxBlockAllocSize);});
    
    for(var i = 0, queueLength = writeQueue.length; i < queueLength; i++){
        requestSize = add(requestSize, writeQueue[i].length);
    }
    
    // Prevent concurrent onFull callbacks
    if(this._pendingOnFull){
        return;
    }
    this._pendingOnFull = true;
    
    this._onFull(this._buffer, requestSize, function(buffer, destination){
        util.setZeroTimeout(function(){
            
            self._pendingOnFull = false;
            
            if(!destination){
                if(self.writable){
                    self.emit("error", new Error("buffer is full"));
                }
                self.destroy();
                return;
            }
            
            self._buffer = buffer;
            self._destination = destination;
            
            self._commit();
        });
    });
};

BlobWriteStream.prototype.end = function(data, encoding){
    
    var self = this;
    
    function _end(){
        self.writable = false;
        self._onEnd();
    }
    
    if(data){
        if(this.write(data, encoding)){
            _end();
        }else{
            self.writable = false;
            this.once("drain", _end);
        }
    }
    else{
        _end();
    }
};

BlobWriteStream.prototype.destroy = function(){
    this.writable = false;
    this._pendingQueueDrain = false;
    this._writeQueue = [];
};

BlobWriteStream.prototype.consume = function(consume){
    
    this._buffer = this._buffer.slice(consume);
    this._destinationPos -= consume;
};

BlobWriteStream.prototype.getCommittedSlice = function(){
    return this._buffer.slice(0, this._destinationPos);
};

function onFull(buffer, extraSize, callback){
    var newBuffer = new Buffer(buffer.length + extraSize);
    buffer.copy(newBuffer);
    callback(newBuffer, newBuffer.slice(buffer.length));
}
*/
exports.BlobReadStream = BlobReadStream;
exports.BlobWriteStream = BlobWriteStream;