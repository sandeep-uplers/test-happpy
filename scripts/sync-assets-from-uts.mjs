#!/usr/bin/env node
/**
 * Copies static assets referenced in test-happpy source that exist in UTS public/
 * but are missing locally. Run after pulling UTS JS changes.
 *
 *   npm run sync:assets
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UTS_PUBLIC = process.env.ASSET_SOURCE || path.resolve(ROOT, '../uts/public');

if (!fs.existsSync(UTS_PUBLIC)) {
    console.error(`UTS public folder not found: ${UTS_PUBLIC}`);
    console.error('Set ASSET_SOURCE=/path/to/uts/public if needed.');
    process.exit(1);
}

process.env.ASSET_SOURCE = UTS_PUBLIC;

let checkOutput;
try {
    checkOutput = execSync('node scripts/check-assets.mjs', {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, ASSET_SOURCE: UTS_PUBLIC },
    });
    console.log(checkOutput);
    console.log('Nothing to sync.');
    process.exit(0);
} catch (err) {
    checkOutput = (err.stdout || '') + (err.stderr || '');
}

const missing = [...checkOutput.matchAll(/^\s+(\/[^\s←]+)/gm)].map((m) => m[1]);
const toCopy = missing.filter((asset) =>
    fs.existsSync(path.join(UTS_PUBLIC, asset.slice(1))),
);

if (toCopy.length === 0) {
    console.log('No copyable assets found in UTS.');
    if (missing.length) {
        console.log('\nStill missing (not in UTS public):');
        missing.forEach((a) => console.log(`  ${a}`));
    }
    process.exit(missing.length ? 1 : 0);
}

console.log(`Copying ${toCopy.length} asset(s) from ${UTS_PUBLIC}:\n`);
for (const asset of toCopy) {
    const src = path.join(UTS_PUBLIC, asset.slice(1));
    const dest = path.join(ROOT, 'public', asset.slice(1));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  ${asset}`);
}

console.log('\nDone. Re-run: npm run test:assets');
