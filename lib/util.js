// if node
var BinaryPack = require('binarypack');
// end node

var util = {
  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
  info: console.log.bind(console),
  warning: function(){},
  error: function(){},
  pack: BinaryPack.pack,
  unpack: BinaryPack.unpack
};

// Stream shim for client side
// if node
var EventEmitter = null;
// end node
var Stream = EventEmitter;

// if node
module.exports = util;
// end node
