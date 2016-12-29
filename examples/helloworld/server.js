var BinaryServer = require('../../').BinaryServer;
var fs = require('fs');
var http = require('http');

// Create an app to serve static file
var app = http.createServer(function (req, res) {
  var stream = fs.createReadStream(__dirname + '/index.html');
  stream.on('error', function (err) {
    res.statusCode = 500;
    res.end(String(err));
  });
  stream.pipe(res);
});

// Start Binary.js server
var server = BinaryServer({server: app});
// Wait for new user connections
server.on('connection', function(client){
  // Stream a flower as a hello!
  var file = fs.createReadStream(__dirname + '/flower.png');
  client.send(file); 
});

app.listen(9000);
console.log('HTTP and BinaryJS server started on port 9000');

