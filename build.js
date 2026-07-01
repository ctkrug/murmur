// Builds the deployable static site by mirroring the app in src/ into site/.
//
// The app has no build step to run locally (serve the repo and open
// src/index.html), so "building" is just copying the self-contained app —
// every file in src/ is an app asset — into the directory the host serves at
// apps.charliekrug.com/boids-playground/. src/index.html already carries the
// "View on GitHub" link, so src/ stays the single source of truth and site/ is
// pure generated output.
//
// Usage: node build.js

import { existsSync, mkdirSync, readdirSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, 'src');
const outDir = join(root, 'site');

if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const files = readdirSync(srcDir);
for (const file of files) {
  copyFileSync(join(srcDir, file), join(outDir, file));
}

process.stdout.write(`Built site/ from src/ (${files.length} files)\n`);
