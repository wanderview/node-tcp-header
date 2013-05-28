// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

module.exports = TcpHeader;

function TcpHeader(opts, offset) {
  if (Buffer.isBuffer(opts)) {
    return TcpHeader.fromBuffer(opts, offset);
  }

  var self = (this instanceof TcpHeader)
           ? this
           : Object.create(TcpHeader.prototype);

  opts = opts || {};
  opts.flags = opts.flags || {};

  self.srcPort = ~~opts.srcPort;
  self.dstPort = ~~opts.dstPort;
  self.seq = ~~opts.seq;
  self.ack = ~~opts.ack;
  self.flags = {
    fin: !!opts.flags.fin,
    syn: !!opts.flags.syn,
    rst: !!opts.flags.rst,
    psh: !!opts.flags.psh,
    ack: !!opts.flags.ack,
    urg: !!opts.flags.urg
  };
  self.window = ~~opts.window;
  self.checksum = ~~opts.checksum;
  self.urgent = ~~opts.urgent;
  self.length = ~~opts.headerLength;

  // TODO: initialize TCP options

  return self;
};

TcpHeader.fromBuffer = function(buf, offset) {
  offset = ~~offset;

  var srcPort = buf.readUInt16BE(offset);
  offset += 2;

  var dstPort = buf.readUInt16BE(offset);
  offset += 2;

  var seq = buf.readUInt32BE(offset);
  offset += 4;

  var ack = buf.readUInt32BE(offset);
  offset += 4;

  var tmp = buf.readUInt8(offset);
  offset += 1;

  var headerLength = ((tmp & 0xf0) >> 4) * 4;

  tmp = buf.readUInt8(offset);
  offset += 1;

  var flags = {
    fin: !!(tmp & 0x01),
    syn: !!(tmp & 0x02),
    rst: !!(tmp & 0x04),
    psh: !!(tmp & 0x08),
    ack: !!(tmp & 0x10),
    urg: !!(tmp & 0x20)
  };

  var window = buf.readUInt16BE(offset);
  offset += 2;

  var checksum = buf.readUInt16BE(offset);
  offset += 2;

  var urgent = buf.readUInt16BE(offset);
  offset += 2;

  // TODO: parse options

  return new TcpHeader({srcPort: srcPort, dstPort: dstPort, seq: seq, ack: ack,
                        flags: flags, window: window, checksum: checksum,
                        urgent: urgent, length: headerLength});
};

TcpHeader.prototype.toBuffer = function(buf, offset) {
  offset = ~~offset;
  buf = (buf instanceof Buffer) ? buf : new Buffer(offset + LENGTH);

  // TODO: implement toBuffer

  return buf;
};

TcpHeader.prototype.setChecksum = function(iph, buf, offset) {
  // TODO: implement setChecksum
};
