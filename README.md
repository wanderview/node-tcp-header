# tcp-header

TCP header serialization.

[![Build Status](https://travis-ci.org/wanderview/node-tcp-header.png)](https://travis-ci.org/wanderview/node-tcp-header)

## Example

```javascript
var TcpHeader = require('tcp-header');

// parse TCP headers in
var tcph = new TcpHeader(inputBuf, inputOffset);
tcph.srcPort === 22;
tcph.dstPort === 5432;
tcph.flags.syn === true;  // flags as booleans in nested flags property
tcph.flags.ack === true;
tcph.flags.fin === false;
tcph.flags.rst === false;
tcph.flags.urg === false;
tcph.flags.psh === false;
tcph.flags.ece === false;
tcph.flags.cwr === false;
tcph.flags.ns  === false;
tcph.seq === 12345678;
tcph.ack === 12345677;
tcph.window === 10000;    // window size
tcph.checksum === 0xabcd; // checksum as-is from buffer
tcph.urgent === 0;        // flags.urg is false
tcph.length === 20;       // TCP header size in bytes

// NOTE: you need the IP header to calculate the overall data payload size.

// TODO: support for TCP options

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
