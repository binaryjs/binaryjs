var fs = require('fs');
var http = require('http');

// Serve client side statically
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);

// Start Binary.js server
var BinaryServer = require('../../').BinaryServer;

// link it to express
var bs = BinaryServer({server: server});

// Wait for new user connections
bs.on('connection', function(client){

  // Incoming stream from browsers
  client.on('stream', function(stream, meta){

    // broadcast to all other clients
    for(var id in bs.clients){
      if(bs.clients.hasOwnProperty(id)){
        var otherClient = bs.clients[id];
        if(otherClient != client){
          var send = otherClient.createStream(meta);
          stream.pipe(send);
        }
      }
    }
  });
});

server.listen(9000);
console.log('HTTP and BinaryJS server started on port 9000');
