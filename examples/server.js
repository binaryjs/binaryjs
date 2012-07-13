var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname + '/public'));


app.listen(9001);

var server = BinaryServer({port: 9000});

server.on('connection', function(client){
  
  console.log('New user connected');
  
  var stream = client.createStream();
  var file = fs.createReadStream(__dirname + '/big.avi');
  file.pipe(stream);
  stream.on('drain', function(){console.log('drain')});
  stream.on('close', function(){console.log('close')});
  
});

