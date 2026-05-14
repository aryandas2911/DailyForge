"use strict";

module.exports = [
  {
    buf: [0],
    rfc4648: ["AA", "aa"],
    crock32: ["00", "0O", "0o"],
    crock32int: ["0", "O", "o"]
  },
  {
    buf: [1],
    rfc4648: ["AE"],
    crock32: ["04"],
    crock32int: ["1", "I", "i", "L", "l"]
  },
  {
    buf: [2],
    rfc4648: ["AI", "ai", "aI", "Ai"],
    crock32: ["08"],
    crock32int: ["2"]
  },
  {
    buf: [3],
    rfc4648: ["AM", "am", "aM", "Am"],
    crock32: ["0C"],
    crock32int: ["3"]
  },
  {
    buf: [4],
    rfc4648: ["AQ", "aq", "aQ", "Aq"],
    crock32: ["0G"],
    crock32int: ["4"]
  },
  {
    buf: [5],
    rfc4648: ["AU", "au", "aU", "Au"],
    crock32: ["0M"],
    crock32int: ["5"]
  },
  {
    buf: [6],
    rfc4648: ["AY", "ay", "aY", "Ay"],
    crock32: ["0R"],
    crock32int: ["6"]
  },
  {
    buf: [7],
    rfc4648: ["A4", "a4"],
    crock32: ["0W"],
    crock32int: ["7"]
  },
  {
    buf: [8],
    rfc4648: ["BA", "ba", "bA", "Ba"],
    crock32: ["10"],
    crock32int: ["8"]
  },
  {
    buf: [9],
    rfc4648: ["BE", "be", "bE", "Be"],
    crock32: ["14"],
    crock32int: ["9"]
  },
  {
    buf: [10],
    rfc4648: ["BI", "bi", "bI", "Bi"],
    crock32: ["18"],
    crock32int: ["A", "a"]
  },
  {
    buf: [11],
    rfc4648: ["BM", "bm", "bM", "Bm"],
    crock32: ["1C"],
    crock32int: ["B", "b"]
  },
  {
    buf: [12],
    rfc4648: ["BQ", "bq", "bQ", "Bq"],
    crock32: ["1G"],
    crock32int: ["C", "c"]
  },
  {
    buf: [13],
    rfc4648: ["BU", "bu", "bU", "Bu"],
    crock32: ["1M"],
    crock32int: ["D", "d"]
  },
  {
    buf: [14],
    rfc4648: ["BY", "by", "bY", "By"],
    crock32: ["1R"],
    crock32int: ["E", "e"]
  },
  {
    buf: [15],
    rfc4648: ["B4", "b4"],
    crock32: ["1W"],
    crock32int: ["F", "f"]
  },
  {
    buf: [16],
    rfc4648: ["CA", "ca", "cA", "Ca"],
    crock32: ["20"],
    crock32int: ["G", "g"]
  },
  {
    buf: [17],
    rfc4648: ["CE", "ce", "cE", "Ce"],
    crock32: ["24"],
    crock32int: ["H", "h"]
  },
  {
    buf: [18],
    rfc4648: ["CI", "ci", "cI", "Ci"],
    crock32: ["28"],
    crock32int: ["J", "j"]
  },
  {
    buf: [19],
    rfc4648: ["CM", "cm", "cM", "Cm"],
    crock32: ["2C"],
    crock32int: ["K", "k"]
  },
  {
    buf: [20],
    rfc4648: ["CQ", "cq", "cQ", "Cq"],
    crock32: ["2G"],
    crock32int: ["M", "m"]
  },
  {
    buf: [21],
    rfc4648: ["CU", "cu", "cU", "Cu"],
    crock32: ["2M"],
    crock32int: ["N", "n"]
  },
  {
    buf: [22],
    rfc4648: ["CY", "cy", "cY", "Cy"],
    crock32: ["2R"],
    crock32int: ["P", "p"]
  },
  {
    buf: [23],
    rfc4648: ["C4", "c4"],
    crock32: ["2W"],
    crock32int: ["Q", "q"]
  },
  {
    buf: [24],
    rfc4648: ["DA", "da", "dA", "Da"],
    crock32: ["30"],
    crock32int: ["R", "r"]
  },
  {
    buf: [25],
    rfc4648: ["DE", "de", "dE", "De"],
    crock32: ["34"],
    crock32int: ["S", "s"]
  },
  {
    buf: [26],
    rfc4648: ["DI", "di", "dI", "Di"],
    crock32: ["38"],
    crock32int: ["T", "t"]
  },
  {
    buf: [27],
    rfc4648: ["DM", "dm", "dM", "Dm"],
    crock32: ["3C"],
    crock32int: ["V", "v"]
  },
  {
    buf: [28],
    rfc4648: ["DQ", "dq", "dQ", "Dq"],
    crock32: ["3G"],
    crock32int: ["W", "w"]
  },
  {
    buf: [29],
    rfc4648: ["DU", "du", "dU", "Du"],
    crock32: ["3M"],
    crock32int: ["X", "x"]
  },
  {
    buf: [30],
    rfc4648: ["DY", "dy", "dY", "Dy"],
    crock32: ["3R"],
    crock32int: ["Y", "y"]
  },
  {
    buf: [31],
    rfc4648: ["D4", "d4"],
    crock32: ["3W"],
    crock32int: ["Z", "z"]
  },
  {
    buf: [0, 0],
    rfc4648: ["AAAA", "aaaa", "AaAa", "aAAa"],
    crock32: ["0000", "oooo", "OOOO", "0oO0"],
  },
  {
    buf: [1, 0],
    rfc4648: ["AEAA", "aeaa", "AeAa", "aEAa"],
    crock32: ["0400", "o4oo", "O4OO", "04oO"],
  },
  {
    buf: [0, 1],
    rfc4648: ["AAAQ", "aaaq", "AaAQ", "aAAq"],
    crock32: ["000G", "ooog", "OOOG", "0oOg"],
  },
  {
    buf: [1, 1],
    rfc4648: ["AEAQ", "aeaq", "AeAQ", "aEAq"],
    crock32: ["040G", "o4og", "O4og", "04Og"],
  },
  {
    buf: [136, 64],
    rfc4648: ["RBAA", "rbaa", "RbAA", "rBAa"],
    crock32: ["H100", "hio0", "HLOo"],
  },
  {
    buf: [139, 188],
    rfc4648: ["RO6A", "r06a", "Ro6A", "r06A"],
    crock32: ["HEY0", "heyo", "HeYO"],
  },
  {
    buf: [54, 31, 127],
    rfc4648: ["GYPX6", "gypx6"],
    crock32: ["6RFQY", "6rfqy"],
  },
  {
    buf: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33],
    rfc4648: ["JBSWY3DPEBLW64TMMQQQ", "jbswy3dpeblw64tmmqqq"],
    crock32: ["91JPRV3F41BPYWKCCGGG", "91jprv3f41bpywkccggg", "9Ljprv3f4ibpywkccggg"],
  },
  {
    buf: [139, 130, 16, 112, 24, 11, 64],
    rfc4648: ["ROBBA4AYBNAA", "robba4aybnaa", "R0BBA4aybnaa"],
    crock32: ["HE110W0R1D00", "helloworld00", "heiiOw0RidoO"],
  },
  {
    buf: [139, 130, 16, 112, 24, 11],
    rfc4648: ["ROBBA4AYBM", "robba4aybm", "R0BBA4aybm"],
    crock32: ["HE110W0R1C", "helloworlc", "heiiOw0RiC"],
  },
  {
    buf: [139, 130, 16, 112, 24, 11, 0],
    rfc4648: ["ROBBA4AYBMAA", "robba4aybmaa", "R0BBA4aybmaa"],
    crock32: ["HE110W0R1C00", "helloworlc00", "heiiOw0RiC00"],
  }
];
