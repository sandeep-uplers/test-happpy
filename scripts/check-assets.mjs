#!/usr/bin/env node
/**
 * Validates static assets referenced in source code exist under public/.
 * Run after UTS sync: npm run test:assets
 *
 * Copy missing files from UTS: npm run sync:assets
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const SOURCE_PUBLIC = process.env.ASSET_SOURCE
    ? path.resolve(process.env.ASSET_SOURCE)
    : null;

/** Referenced in UTS but missing from both repos' public/ — tracked separately, not a sync gap. */
const KNOWN_GAPS = new Set(['/images/default-company.png']);

const SCAN_DIRS = ['talent', 'app', 'styles']
    .map((d) => path.join(ROOT, d))
    .filter((d) => fs.existsSync(d));

const STATIC_EXT =
    /\.(?:svg|png|jpe?g|webp|gif|ico|mp4|webm|woff2?|ttf|otf|css)(?:\?[^"'`\s]*)?$/i;

const ASSET_ROOTS = [
    '/images/',
    '/fonts/',
    '/css/',
    '/happpy-agent/',
    '/videos/',
    '/assets/',
];

/** Skip dynamic template segments and non-file paths. */
function isStaticAssetPath(p) {
    if (!p.startsWith('/')) return false;
    if (p.includes('${') || p.includes('[') || p.includes(']')) return false;
    if (p.startsWith('/api/') || p.startsWith('/talent/auth/')) return false;
    if (!STATIC_EXT.test(p)) return false;
    if (!ASSET_ROOTS.some((root) => p.startsWith(root) || p === root)) return false;
    return true;
}

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (/\.(js|jsx|ts|tsx|css|html)$/.test(entry.name)) files.push(full);
    }
    return files;
}

function extractFromContent(content) {
    const found = new Set();

    // String literals: "/path/to/file.svg"
    for (const m of content.matchAll(/["'`](\/[^"'`\n]+)["'`]/g)) {
        const p = m[1].split(/[#?]/)[0];
        if (isStaticAssetPath(p)) found.add(p);
    }

    // url(/path) in CSS
    for (const m of content.matchAll(/url\(\s*['"]?(\/[^'"`)]+)['"]?\s*\)/g)) {
        const p = m[1].split(/[#?]/)[0];
        if (isStaticAssetPath(p)) found.add(p);
    }

    return found;
}

function existsLocal(assetPath) {
    return fs.existsSync(path.join(PUBLIC, assetPath.slice(1)));
}

function existsSource(assetPath) {
    if (!SOURCE_PUBLIC) return null;
    return fs.existsSync(path.join(SOURCE_PUBLIC, assetPath.slice(1)));
}

const sourceFiles = SCAN_DIRS.flatMap((d) => walk(d));
const allAssets = new Set();
for (const file of sourceFiles) {
    for (const asset of extractFromContent(fs.readFileSync(file, 'utf8'))) {
        allAssets.add(asset);
    }
}

const missing = [];
const knownGaps = [];

for (const asset of [...allAssets].sort()) {
    if (existsLocal(asset)) continue;
    if (KNOWN_GAPS.has(asset)) {
        knownGaps.push(asset);
        continue;
    }
    missing.push({ asset, inSource: existsSource(asset) });
}

console.log(`Scanned ${sourceFiles.length} files → ${allAssets.size} static asset paths.\n`);

if (knownGaps.length) {
    console.log(`Known gaps (missing in UTS too): ${knownGaps.join(', ')}\n`);
}

if (missing.length === 0) {
    console.log('All syncable static assets exist under public/.');
    process.exit(0);
}

console.log(`MISSING ${missing.length} asset(s):\n`);
for (const { asset, inSource } of missing) {
    const hint =
        inSource === true
            ? ' ← copy from UTS (npm run sync:assets)'
            : inSource === false
              ? ' ← not in UTS public either'
              : '';
    console.log(`  ${asset}${hint}`);
}

process.exit(1);
