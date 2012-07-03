var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');

var server = BinaryServer({port: 9000});

server.on('connection', function(stream){
  
  console.log('New user connected');
  
  var file = fs.createReadStream('flower.png');

  file.pipe(stream);
  
});

