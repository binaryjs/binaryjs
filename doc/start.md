# Getting Started with BinaryJS

In this guide we'll download, install, and then build the [helloworld](https://github.com/binaryjs/binaryjs/tree/master/examples/helloworld) example. In this example we send clients a picture of a flower by piping the file into a binary websocket;

## Download

1. Install the BinaryJS server

```console
$ npm install binaryjs
```
or from Git
```console
$ git://github.com/binaryjs/binaryjs.git
$ cd binaryjs 
$ npm install -g
```

2. Get the latest client library for your webpage

```html
<script src="http://cdn.binaryjs.com/0/binary.js"></script>
```

## Create the server
[View complete server.js source](https://github.com/binaryjs/binaryjs/blob/master/examples/helloworld/server.js)

First we include BinaryJS and the fs module

```js
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
```

Then we create a new server, specifying that we want to run it on port 9000:

```js
var server = BinaryServer({port: 9000});
```

Now we'll add a callback for new client connections

```js
server.on('connection', function(client){
  //
});
```

Let's add to that callback so when a client connects, we'll send them a picture as a hello world

```js
server.on('connection', function(client){	
  var file = fs.createReadStream(__dirname + '/flower.png');
  client.send(file); 
});
```

Note that instead of `client.send(file)` we could've done this:

```js
var stream = client.createStream();
file.pipe(stream);
```

`client.send` is a helper function for doing just that when it takes a stream parameter, note that behavior is different for other parameter types. [See API reference](https://github.com/binaryjs/binaryjs/blob/master/doc/api.md#clientsenddata-meta).

That's it for the server!

## Create the client
[View complete index.html source](https://github.com/binaryjs/binaryjs/blob/master/examples/helloworld/index.html)

Make sure to include the client library, served by the cdn

```html
<script src="http://cdn.binaryjs.com/0/binary.js"></script>
```

Now here's our client side Javascript so we can receive that file

First we connection the server we just created

```js
var client = new BinaryClient('ws://localhost:9000');
```

Then we'll add a callback for the `stream` event, which is emitted when the server sends us the flower file stream.

```js
client.on('stream', function(stream, meta){    
  //
});
```

Now to finish up, inside that callback we need to do several things:
* Create an array to hold the parts of the image
* Add to array on the stream `data` event
* Create an `<img>` element and set the src to the data

```js
client.on('stream', function(stream, meta){    
  	var parts = [];
	stream.on('data', function(data){
	  parts.push(data);
	});
	stream.on('end', function(){
	  var img = document.createElement("img");
	  img.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
	  document.body.appendChild(img);
	});
});
```

## Integrating with an existing node app
BinaryServer can listen on an existing [http.Server](http://nodejs.org/api/http.html#http_class_http_server) by specifying the `server` parameter in the options. See [fileupload](https://github.com/binaryjs/binaryjs/tree/master/examples/fileupload) example of this.

```js
var http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(9000);

var BinaryServer = require('binaryjs').BinaryServer,
    fs = require('fs');

// Create a BinaryServer attached to our existing server
var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint'});

binaryserver.on('connection', function(client){
  var file = fs.createReadStream(__dirname + '/flower.png');
  client.send(file);
});
```

Note that we've also supplied `path: 'binary-endpoint'` to set an endpoint that doesn't clash with the original application.  When creating the client you can connect to this endpoint with:

```js
var client = new BinaryClient('ws://localhost:9000/binary-endpoint');
```

### Express.js

If your app runs on express js - the normal `app.listen(9000)` won't give you access to the base http server, instead you should create the a server and pass the express app as a request listener:

```js
var http = require('http');
var app = require('express')();

// create a server with the express app as a listener
var server = http.createServer(app).listen(9000);

// attach BinaryServer to the base http server
```


## Running the example
Run the server, and open index.html in your favorite binary socket compatible browser, and you'll see a lovely flower!

## Additonal details
This example shows you how to include the server and client BinaryJS libraries and stream your first piece of data. 

BinaryJS is extremely flexible. You aren't limited to sending only binary data. In fact you can send any JSON compatible type and take advantage of the compact BinaryPack serialization format.

You aren't limited to piping streams around either. You can create as many streams as you want for each client, and send data bidirectionally, whether its a large buffer at once, chunked, or just strings and numbers and arrays and hashes.

[Check out the API reference](https://github.com/binaryjs/binaryjs/blob/master/doc/api.md)

[Ask questions on the mailing list](http://groups.google.com/group/binaryjs-group)
