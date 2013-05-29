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
    urg: !!opts.flags.urg,
    ece: !!opts.flags.ece,
    cwr: !!opts.flags.cwr,
    ns:  !!opts.flags.ns
  };
  self.window = ~~opts.window;
  self.checksum = ~~opts.checksum;
  self.urgent = ~~opts.urgent;
  self.options = opts.options || [];

  self.length = opts.length || 20;

  if (self.length < 20) {
    throw new Error("Illegal TCP header length '" + self.length +
                    "'. Must be 20 bytes or more.");
  }

  var calcLength = 20;
  for (var i in self.options) {
    calcLength += self.options[i].value.length + 1;
  }
  if (self.options.length) calcLength += 1;

  if (self.length !== calcLength) {
    throw new Error("Illegal TCP header length '" + self.length +
                    "'. Expected '" + calcLength + "' for given TCP options.");
  }

  return self;
};

TcpHeader.fromBuffer = function(buf, offset) {
  offset = ~~offset;

  var startOffset = offset;

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
  var ns = !!(tmp & 0x01);

  tmp = buf.readUInt8(offset);
  offset += 1;

  var flags = {
    fin: !!(tmp & 0x01),
    syn: !!(tmp & 0x02),
    rst: !!(tmp & 0x04),
    psh: !!(tmp & 0x08),
    ack: !!(tmp & 0x10),
    urg: !!(tmp & 0x20),
    ece: !!(tmp & 0x40),
    cwr: !!(tmp & 0x80),
    ns:  ns
  };

  var window = buf.readUInt16BE(offset);
  offset += 2;

  var checksum = buf.readUInt16BE(offset);
  offset += 2;

  var urgent = buf.readUInt16BE(offset);
  offset += 2;

  var options = [];

  while (offset < (headerLength - startOffset)) {
    var kind = buf.readUInt8(offset);
    offset += 1;
    var value = null;
    if (kind === 0) {
      break;
    } else if (kind === 1) {
      value = new Buffer(0);
    } else {
      var optionLength = buf.readUInt8(offset);
      offset += 1;
      var value = buf.slice(offset, offset + optionLength - 2);
    }
    options.push({kind: kind, value: value});
  }

  return new TcpHeader({srcPort: srcPort, dstPort: dstPort, seq: seq, ack: ack,
                        flags: flags, window: window, checksum: checksum,
                        urgent: urgent, options: options,
                        length: headerLength});
};

TcpHeader.prototype.toBuffer = function(buf, offset) {
  offset = ~~offset;
  buf = (buf instanceof Buffer) ? buf : new Buffer(offset + LENGTH);

  var startOffset = offset;

  buf.writeUInt16BE(this.srcPort, offset);
  offset += 2;

  buf.writeUInt16BE(this.dstPort, offset);
  offset += 2;

  buf.writeUInt32BE(this.seq, offset);
  offset += 4;

  buf.writeUInt32BE(this.ack, offset);
  offset += 4;

  var tmp = ((this.length / 4) & 0x0f) << 4;
  if (this.flags.ns) tmp |= 0x01;
  buf.writeUInt8(tmp, offset);
  offset += 1;

  tmp = 0;
  if (this.flags.fin) tmp |= 0x01;
  if (this.flags.syn) tmp |= 0x02;
  if (this.flags.rst) tmp |= 0x04;
  if (this.flags.psh) tmp |= 0x08;
  if (this.flags.ack) tmp |= 0x10;
  if (this.flags.urg) tmp |= 0x20;
  if (this.flags.ece) tmp |= 0x40;
  if (this.flags.cwr) tmp |= 0x80;
  buf.writeUInt8(tmp, offset);
  offset += 1;

  buf.writeUInt16BE(this.window, offset);
  offset += 2;

  buf.writeUInt16BE(this.checksum, offset);
  offset += 2;

  buf.writeUInt16BE(this.urgent, offset);
  offset += 2;

  for (var i in this.options) {
    var option = this.options[i];

    buf.writeUInt8(option.kind, offset);
    offset += 1;

    if (option.kind === 1) {
      continue;
    }

    var optionLength = 2 + option.value.length;
    buf.writeUInt8(optionLength, offset);
    offset += 1;

    option.value.copy(buf, offset);
    offset += option.value.length;
  }
  if (this.options.length) {
    buf.writeUInt8(0, offset);
    offset += 1;
  }

  return buf;
};

TcpHeader.prototype.setChecksum = function(iph, buf, offset) {
  // TODO: implement setChecksum
};
