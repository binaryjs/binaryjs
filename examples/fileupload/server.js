var fs = require('fs');
// Serve client side statically
var express = require('express');
var app = express.createServer().listen(9000);
app.use(express.static(__dirname + '/public'));

// Start Binary.js server
var BinaryServer = require('binaryjs').BinaryServer;
var server = BinaryServer({port: 9001});

//
//
// Wait for new user connections
server.on('connection', function(client){
  // Incoming stream from browsers
  client.on('stream', function(stream, meta){
    //
    var file = fs.createWriteStream(__dirname+ '/' + meta.name);
    stream.pipe(file);
    //
    // Send progress back
    stream.on('data', function(data){
      stream.write({rx: data.length / meta.size});
    });
    //
  });
});
//
//

console.log('HTTP server started on port 9000');
console.log('BinaryJS server started on port 9001');