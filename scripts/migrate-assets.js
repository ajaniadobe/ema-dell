#!/usr/bin/env node
/**
 * Asset Migration Script
 * Downloads external assets (images, videos) referenced in the content HTML
 * and updates the content to use local relative paths.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import path from 'path';

const CONTENT_DIR = '/workspace/content/en-us/shop/scc/sc';
const CONTENT_FILE = path.join(CONTENT_DIR, 'artificial-intelligence.plain.html');
const MEDIA_DIR = path.join(CONTENT_DIR, 'media');

/**
 * Derive a clean filename from a URL.
 * Uses a short hash prefix + descriptive name to avoid collisions.
 */
function deriveFilename(url) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 8);
  const urlObj = new URL(url);
  const { pathname } = urlObj;

  // Extract meaningful filename from path
  const baseName = path.basename(pathname)
    .replace(/\.(psd|svg)$/, '.png') // normalize format (Dell serves PSD/SVG as PNG)
    .replace(/[?&].*$/, ''); // strip query params from filename

  // Determine extension from the URL or query params
  let ext = path.extname(baseName).toLowerCase();
  const fmtMatch = url.match(/[?&]fmt=([a-z-]+)/);
  if (fmtMatch) {
    const fmt = fmtMatch[1];
    if (fmt === 'png-alpha') ext = '.png';
    else if (fmt === 'webp') ext = '.webp';
    else if (fmt === 'jpg' || fmt === 'jpeg') ext = '.jpg';
  }

  if (!ext || ext === '.psd') ext = '.png';

  // Clean up the base name
  const cleanName = path.basename(baseName, path.extname(baseName))
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60);

  return `${hash}-${cleanName}${ext}`;
}

/**
 * Download a file from URL to local path.
 */
async function downloadAsset(url, destPath) {
  // Normalize http to https
  const fetchUrl = url.replace(/^http:\/\//, 'https://');

  const response = await fetch(fetchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; EDS-Migration/1.0)',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${fetchUrl}`);
  }

  const fileStream = createWriteStream(destPath);
  await pipeline(response.body, fileStream);
}

async function main() {
  console.log('=== EDS Asset Migration ===\n');

  // Read content HTML
  const html = await readFile(CONTENT_FILE, 'utf-8');
  console.log(`Read content file: ${CONTENT_FILE}`);

  // Find all external asset URLs in the HTML
  // Match src="...", srcset="...", and href="...mp4" patterns
  const urlPatterns = [
    /src="(https?:\/\/i\.dell\.com[^"]+)"/g,
    /srcset="(https?:\/\/i\.dell\.com[^"]+)"/g,
    /href="(https?:\/\/i\.dell\.com[^"]*\.mp4[^"]*)"/g,
  ];

  const urlMap = new Map(); // original URL -> local relative path

  for (const pattern of urlPatterns) {
    for (const match of html.matchAll(pattern)) {
      const url = match[1];
      if (!urlMap.has(url)) {
        const filename = deriveFilename(url);
        urlMap.set(url, `./media/${filename}`);
      }
    }
  }

  console.log(`Found ${urlMap.size} unique external assets\n`);

  // Create media directory
  await mkdir(MEDIA_DIR, { recursive: true });

  // Download all assets
  let downloaded = 0;
  let failed = 0;
  const errors = [];

  for (const [url, localPath] of urlMap) {
    const filename = path.basename(localPath);
    const destPath = path.join(MEDIA_DIR, filename);

    try {
      process.stdout.write(`  [${downloaded + failed + 1}/${urlMap.size}] ${filename}...`);
      await downloadAsset(url, destPath);
      downloaded += 1;
      console.log(' OK');
    } catch (err) {
      failed += 1;
      console.log(` FAILED: ${err.message}`);
      errors.push({ url, error: err.message });
    }
  }

  console.log(`\nDownloaded: ${downloaded}, Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\nFailed downloads:');
    errors.forEach(({ url, error }) => console.log(`  - ${url}: ${error}`));
  }

  // Update content HTML with local paths
  let updatedHtml = html;
  for (const [originalUrl, localPath] of urlMap) {
    // Escape special regex characters in the URL
    const escaped = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updatedHtml = updatedHtml.replace(new RegExp(escaped, 'g'), localPath);
  }

  // Write updated content
  await writeFile(CONTENT_FILE, updatedHtml, 'utf-8');
  console.log('\nUpdated content file with local asset references.');
  console.log(`Media directory: ${MEDIA_DIR}`);
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
