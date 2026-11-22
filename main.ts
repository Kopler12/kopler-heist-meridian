// main.ts — Meridian Heist's hand-in program (Node 22, standard library only).
//
// It hands the game to make.fun: it copies this repository's game/ and
// screenshots/ into the output directory and writes /output/dossier.json,
// the summary the judge reads, built by the vendored make.fun library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output. The program
// is deterministic: two runs over the same repository write byte-identical
// files, because it only copies files and calls buildDossier, which writes
// canonical JSON from the same inputs every time.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// This file's directory: the repository root, beside game/ and screenshots/.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader gives us /output; a local run takes MAKEFUN_OUTPUT_DIR instead.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Copy a directory tree when it exists, creating the target first. */
function copyTree(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree('game');
copyTree('screenshots');

// The gate's own caps, so this program refuses exactly what the scorer
// would refuse: at most 4 screenshots of 256 KiB each, at most 993 entries
// and 48 MiB under game/, and no game path over 1,000 bytes. Only
// text_max_bytes shapes the dossier's bytes.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
