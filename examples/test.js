var binaryjs = require('binaryjs');
var fs = require('fs');

var server = new binaryjs.BinaryServer({port: 9000});

server.on('connection', function(stream){
  
  stream.on('close', function(){console.log('stream closed')});
  
  var fd = fs.createReadStream('test.avi');
  fd.pipe(stream, {end: false});
  
});

