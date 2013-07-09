# BinaryJS API Reference

## Class: binaryjs.BinaryServer `Node.js only`

This class is a the BinaryJS websocket server. It is an `EventEmitter`.

### new binaryjs.BinaryServer([options], [callback])

* `options` Object
  * `host` String. Default `0.0.0.0`
  * `port` Number
  * `server` Object. Use an existing `http.Server` or `ws.Server` instead of creating a new one.
  * `path` String. The path on which to accept WebSocket connections
  * `chunkSize` Number. Passed into constructor of connecting `BinaryClient`. Default `40960`

Construct a new server object.

Either `port` must be provided or `server` to use an existing `http.Server`.

### server.clients

A hash of all connected clients. Keys are client ids and values are instances of `binaryjs.BinaryClient`.

### server.close()

Close the server and terminate all clients.

### Event: 'error'

`function (error) { }`

If the underlying server emits an error, it will be forwarded here.

### Event: 'connection'

`function (client) { }`

When a new BinaryJS connection is established. `client` is an object of type `binaryjs.BinaryClient`.



## Class: binaryjs.BinaryClient `Node.js and browsers`

This class represents a BinaryJS websocket client connection. It is an `EventEmitter`.

### new binaryjs.BinaryClient(address, [options])

Connects to the given `address` (in the form `ws://url`). 

* `options` Object
  * `chunkSize` Number. Size of chunks when using `client.send`. Default `40960`

`BinaryClient` can also be obtained in the `connection` event of a `BinaryServer`
  
### client.streams

A hash of all current streams. Keys are stream ids and values are instances of `binaryjs.BinaryStream`.

### client.createStream([meta])

Returns `binaryjs.BinaryStream`

Creates a new readable and writable `binaryjs.BinaryStream` object, triggering a `stream` event on the remote client with the given `meta` data parameter.

### client.send(data, [meta])

Returns `binaryjs.BinaryStream`

Creates a new readable and writable `binaryjs.BinaryStream` object with the given `meta` data and sends `data` through the connection.

If `data` is a Node.js `Buffer` or browser `ArrayBuffer`, `ArrayBufferView`, `Blob`, or `File`, the data will be chunked according to `options.chunkSize` and streamed through the new `BinaryStream`.

If `data` is a Node.js stream (including `BinaryStream` objects), it will be piped into a new `BinaryStream`

If `data` is any other type, it will be sent through the stream in one chunk.

### client.close()

Gracefully closes the connection.

### Event: 'stream'

`function (stream, meta) { }`

Emitted when a new stream is initialized by the remote client. 

`stream` is a `binaryjs.BinaryStream` object that is both readable and writable.

`meta` is the data given when the stream was created via `createStream(meta)` or `send(data, meta)`, sent verbatim.

### Event: 'error'

`function (error) { }`

If the client emits an error, this event is emitted (errors from the underlying `net.Socket` are forwarded here).

### Event: 'close'

`function () { }`

Is emitted when the connection is closed.

The `close` event is also emitted when then underlying `net.Socket` closes the connection (`end` or `close`).

### Event: 'open'

`function () { }`

Emitted when the connection is established.




## Class: binaryjs.BinaryStream `Node.js and browsers`

This class represents a BinaryJS client stream. It is a Node.js `Stream` and `EventEmitter`.

BinaryStreams are created through the `BinaryClient` `createStream` and `send` methods and received through the `stream` event.

Because `BinaryStream` extends the Node.js `stream`, all other streams can be piped into or from a `BinaryStream`. The browser implements a browser version of the Node.js `stream` API.
  
### stream.id

A id number identifying the stream. Unique to the given client, but not globally.

### stream.readable

Whether stream is readable.

### stream.writable

Whether stream is writable.

### stream.paused

Whether stream is paused.

### stream.pause()

Pause the stream.

### stream.resume()

Resume the stream.

### stream.end()

Sends an end message, triggering the `end` event and marks `stream.readable` false but does not close the socket.


### stream.write(data)

Returns `true` if data is written immediately or `false` if data is buffered in socket.

Writes `data` through the connection. `data` can be any JSON compatible type or binary data. Note data will not be chunked. `client.send` should be used for chunking.

### stream.destroy()

Immediately closed the socket.

### stream.pipe(destination, [options])

This is a Stream.prototype method available on all Streams.

See:
http://nodejs.org/api/stream.html#stream_stream_pipe_destination_options

### Event: 'data'

`function (data) { }`

Is emitted when data is received through the socket.

For non-binary types, data is received verbatim as sent.

On Node.js, binary data is received as `Buffer`.

On browsers, binary data is received as `ArrayBuffer`.

### Event: 'pause'

`function () { }`

Is emitted when stream is paused.

### Event: 'resume'

`function () { }`

Is emitted when stream is resumed.

### Event: 'end'

`function () { }`

Is emitted when `stream.end` has been called. `stream.readable` is set to `false`.

### Event: 'close'

`function () { }`

Emitted when the connection is destroyed or its underlying socket is closed.


### Event: 'drain'

`function () { }`

Emitted when the underlying socket buffer has drained. Used for stream pipe internals.

### Event: 'error'

`function (error) { }`

If the client emits an error, this event is emitted (errors from the underlying net.Socket are forwarded here). `stream.readable` and `stream.writable` are set to `false`.

