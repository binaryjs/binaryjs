[![Build Status](https://secure.travis-ci.org/binaryjs/binaryjs.png)](http://travis-ci.org/binaryjs/binaryjs)

BinaryJS
========

We're under development!

For docs and more info
http://binaryjs.com

Node binary websocket streaming made easy


## Download

Server

```console
$ npm install binaryjs
```
or from Git
```console
$ git clone git://github.com/binaryjs/binaryjs.git
$ cd binaryjs
$ npm install -g
```

Client

```html
<script src="http://cdn.binaryjs.com/0/binary.js"></script>
```

### http://binaryjs.com for docs and demos


## Changelog
0.2.1

- Update js-binarypack to 0.0.7, fast utf8 support now on by default.

0.2.0

- Fix critical BinaryPack issue prevent TypedArrays of 16 bit or greater from being serialized correctly

0.1.9

- Fix close internal socket (removing not supported code/message parameters)

0.1.8

- Does not throw exceptions when writing on a stream with closed underlying socket
- StreamID no longer has to be a number
- Use newer version of node-binarypack

0.1.7

- Fix critical bug involving drain event not firing. Bump `streamws` to 0.1.1

0.1.5

- `streamws` version `>=0.1.0` is now required
- Streams no longer add their own listeners to error/close/drain events (fixes leaks)
- Calls to `socket.send` no longer include `{binary: true}` or callback parameters (fixes type error in some browsers)
