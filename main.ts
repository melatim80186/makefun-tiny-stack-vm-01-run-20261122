// Tiny stack VM for make.fun tiny-stack-vm-01-run-20261122.
// Faithful interpreter of ISA.md v1; where the text could be read two ways,
// the reference VM (generator/subject/vm.mjs) is the rule. No dependencies.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Opcode table: byte -> [immediate bytes, values popped, values pushed].
// Absent entries are unknown opcodes (trap 5).
const T: Array<[number, number, number] | 0> = new Array(256).fill(0);
const d = (o: number, a: number, b: number, c: number): void => {
  T[o] = [a, b, c];
};
d(0x00, 0, 0, 0); d(0x01, 1, 0, 1); d(0x02, 4, 0, 1); d(0x03, 0, 1, 0);
d(0x04, 0, 1, 2); d(0x05, 0, 2, 2); d(0x06, 0, 2, 3); d(0x07, 0, 3, 3);
d(0x10, 0, 2, 1); d(0x11, 0, 2, 1); d(0x12, 0, 2, 1); d(0x13, 0, 2, 1);
d(0x14, 0, 2, 1); d(0x15, 0, 2, 1); d(0x16, 0, 2, 1); d(0x17, 0, 1, 1);
d(0x18, 0, 2, 1); d(0x19, 0, 2, 1); d(0x1a, 0, 2, 1); d(0x1b, 0, 1, 1);
d(0x1c, 0, 2, 1); d(0x1d, 0, 2, 1); d(0x1e, 0, 2, 1); d(0x20, 0, 2, 1);
d(0x21, 0, 2, 1); d(0x22, 0, 2, 1); d(0x30, 2, 0, 0); d(0x31, 2, 1, 0);
d(0x32, 2, 1, 0); d(0x33, 2, 0, 0); d(0x34, 0, 0, 0); d(0x40, 0, 1, 1);
d(0x41, 0, 2, 0); d(0x50, 0, 1, 0); d(0x51, 0, 1, 0); d(0x52, 0, 0, 1);
d(0x53, 0, 1, 0);

const E = new TextEncoder();

function run(p: Uint8Array, q: Uint8Array): { out: Uint8Array; code: number } {
  const L = p.length;
  const D = new Int32Array(256);
  const C = new Int32Array(64);
  const M = new Int32Array(256);
  const O = new Uint8Array(65536);
  let s = 0, c = 0, o = 0, ip = 0, pc = 0, st = 0;
  const done = (code: number): { out: Uint8Array; code: number } => ({ out: O.slice(0, o), code });
  for (;;) {
    if (st === 1000000) return done(10);
    if (pc < 0 || pc >= L) return done(9);
    const op = p[pc];
    const sp = T[op];
    if (!sp) return done(5);
    const im = sp[0];
    if (pc + im >= L) return done(9);
    st++;
    const nx = pc + 1 + im;
    if (s < sp[1]) return done(2);
    if (s - sp[1] + sp[2] > 256) return done(3);
    pc = nx;
    switch (op) {
      case 0x00: return done(0);
      case 0x01: D[s++] = (p[nx - 1] << 24) >> 24; break;
      case 0x02:
        D[s++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24);
        break;
      case 0x03: s--; break;
      case 0x04: D[s] = D[s - 1]; s++; break;
      case 0x05: { const t = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = t; break; }
      case 0x06: D[s] = D[s - 2]; s++; break;
      case 0x07: {
        const a = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = a;
        break;
      }
      case 0x17: D[s - 1] = -D[s - 1] | 0; break;
      case 0x1b: D[s - 1] = ~D[s - 1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15:
      case 0x16: case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d:
      case 0x1e: case 0x20: case 0x21: case 0x22: {
        const b = D[s - 1];
        const a = D[s - 2];
        let r: number;
        switch (op) {
          case 0x10: r = (a + b) | 0; break;
          case 0x11: r = (a - b) | 0; break;
          case 0x12: r = Math.imul(a, b); break;
          case 0x13:
            if (b === 0) return done(4);
            r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
            break;
          case 0x14:
            if (b === 0) return done(4);
            r = b === -1 ? 0 : (a % b) | 0;
            break;
          case 0x15:
            if (b === 0) return done(4);
            r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
            break;
          case 0x16:
            if (b === 0) return done(4);
            r = ((a >>> 0) % (b >>> 0)) | 0;
            break;
          case 0x18: r = a & b; break;
          case 0x19: r = a | b; break;
          case 0x1a: r = a ^ b; break;
          case 0x1c: r = a << (b & 31); break;
          case 0x1d: r = a >> (b & 31); break;
          case 0x1e: r = (a >>> (b & 31)) | 0; break;
          case 0x20: r = a === b ? 1 : 0; break;
          case 0x21: r = a < b ? 1 : 0; break;
          default: r = (a >>> 0) < (b >>> 0) ? 1 : 0; break;
        }
        s -= 2;
        D[s++] = r;
        break;
      }
      case 0x30: case 0x31: case 0x32: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        let take = true;
        if (op !== 0x30) {
          const v = D[--s];
          take = op === 0x31 ? v === 0 : v !== 0;
        }
        if (take) pc = nx + rel;
        break;
      }
      case 0x33:
        if (c === 64) return done(7);
        C[c++] = nx;
        pc = p[nx - 2] | (p[nx - 1] << 8);
        break;
      case 0x34:
        if (c === 0) return done(8);
        pc = C[--c];
        break;
      case 0x40: {
        const a = D[s - 1];
        if (a < 0 || a >= 256) return done(6);
        D[s - 1] = M[a];
        break;
      }
      case 0x41: {
        const a = D[s - 1];
        const v = D[s - 2];
        if (a < 0 || a >= 256) return done(6);
        s -= 2;
        M[a] = v;
        break;
      }
      case 0x50: {
        const by = E.encode(String(D[s - 1]));
        if (o + by.length > 65536) return done(11);
        s--;
        O.set(by, o);
        o += by.length;
        break;
      }
      case 0x51:
        if (o + 1 > 65536) return done(11);
        O[o++] = D[--s] & 255;
        break;
      case 0x52: D[s++] = ip < q.length ? q[ip++] : -1; break;
      case 0x53: return done(D[--s] & 255);
      default: return done(5);
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.out);
  writeFileSync(join(O, id, 'exit.txt'), `${r.code}\n`);
}
