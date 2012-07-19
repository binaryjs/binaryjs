var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname + '/public'));
app.listen(9001);






// Start Binary.js server
var server = BinaryServer({port: 9000});

// Wait for new user connections
server.on('connection', function(client){
  
  console.log('New user connected');
  
  // Incoming stream from browsers
  client.on('stream', function(stream){
    var w = fs.createWriteStream(__dirname+ '/' + stream.id+'.png');
    stream.pipe(w);
  });
  
  // Stream a flower as a hello!
  var file = fs.readFileSync(__dirname + '/flower.png');
  client.send(file);
  
  setInteval(function(){
    console.log(server.clients, client.streams);
  }, 1000);
  
});

