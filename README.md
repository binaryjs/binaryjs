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

0.1.7
Fix critical bug involving drain event not firing. Bump `streamws` to 0.1.1

0.1.5

- `streamws` version `>=0.1.0` is now required
- Streams no longer add their own listeners to error/close/drain events (fixes leaks)
- Calls to `socket.send` no longer include `{binary: true}` or callback parameters (fixes type error in some browsers)