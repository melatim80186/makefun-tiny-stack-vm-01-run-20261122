[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/melatim80186/makefun-tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/melatim80186/makefun-tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)

# tiny-stack-vm

Faithful interpreter of make.fun's tiny stack ISA v1 for
tiny-stack-vm-01-run-20261122: wrapping 32-bit ints, 256-value stack,
64-deep calls, 256 words of memory, all ten traps, step/output limits.
One file, no dependencies, Node 22.

Run: `node main.ts` (`MAKEFUN_INPUT_DIR` / `MAKEFUN_OUTPUT_DIR`).
Writes `<id>/stdout.bin` + `<id>/exit.txt` per instance.

Practice: **1,000,000 / 1,000,000** (40/40). House baseline plain-vm 1.0.0: 670,000.
