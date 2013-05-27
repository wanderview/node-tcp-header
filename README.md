# tcp-header

TCP header serialization.

[![Build Status](https://travis-ci.org/wanderview/node-tcp-header.png)](https://travis-ci.org/wanderview/node-tcp-header)

## Example

```javascript
var TcpHeader = require('tcp-header');

// parse TCP headers in
var tcph = new TcpHeader(inputBuf, inputOffset);
tcph.srcPort === 52;
tcph.dstPort === 5432;
// TODO: flags, seq, ack, window, options

// write UDP headers out
var out = tcph.toBuffer();

// By default, the TCP checksum is not calculated.  It is passed through
// if you parse an existing buffer or set to the opts.checksum constructor
// option.
//
// To calculate the checksum you must call setChecksum() with the ip header
// object and tcp payload buffer.
var iph = new IpHeader({dst:'1.1.1.1', src:'2.2.2.2'});
tcph.setChecksum(iph, buf, offset);

// To write a buffer in place, provide the buffer and option offset
// after the packet object.
tcph.toBuffer(buf, offset);
```
