#!/usr/bin/env node
/* check-tools.mjs — Tools Kit consistency check (dev-only, not loaded by the page).
   Asserts: every registry entry has exactly one builder, no duplicate tool IDs,
   and no builder exists without a registry entry.
   Usage: node check-tools.mjs [path-to-tools.js]   (exit 1 on failure) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || join(here, 'tools.js');
const src = readFileSync(file, 'utf8');

const registry = [...src.matchAll(/\{id:'([a-z0-9]+)',\s*ic:/g)].map(m => m[1]);
const builders = [...src.matchAll(/(?:^|\n)\s*(?:async\s+)?([a-z][a-zA-Z0-9]*)\(el\)\s*\{/g)].map(m => m[1]);

const seen = new Set(), dup = [];
for (const id of registry) { if (seen.has(id)) dup.push(id); seen.add(id); }
const bset = new Set(builders);
const missing = registry.filter(id => !bset.has(id));
const extra = builders.filter(k => !seen.has(k));
const bdup = builders.filter((k, i) => builders.indexOf(k) !== i);

let ok = true;
const fail = msg => { ok = false; console.error('FAIL:', msg); };
if (registry.length !== 68) fail(`registry has ${registry.length} tools, expected 68`);
if (dup.length) fail(`duplicate registry IDs: ${dup.join(', ')}`);
if (bdup.length) fail(`duplicate builders: ${[...new Set(bdup)].join(', ')}`);
if (missing.length) fail(`registry entries with NO builder: ${missing.join(', ')}`);
if (extra.length) fail(`builders with NO registry entry: ${extra.join(', ')}`);

if (ok) console.log(`PASS: ${registry.length} registry entries, ${builders.length} builders, no duplicates, every tool has a builder.`);
process.exit(ok ? 0 : 1);
