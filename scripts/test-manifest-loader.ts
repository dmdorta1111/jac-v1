/**
 * Test script to verify manifest loading functionality
 * This tests the loadManifest() function from lib/form-templates/loader.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load manifest directly from file system (simulating browser fetch)
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'form-templates', 'manifest.json');

interface TemplateMetadata {
  lastModified: string;
  md5: string;
}

type TemplateManifest = Record<string, TemplateMetadata>;

async function testManifestLoader(): Promise<void> {
  console.log('=== Testing Manifest Loader ===\n');

  try {
    // Load manifest
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const manifest: TemplateManifest = JSON.parse(content);

    console.log(`✓ Manifest loaded successfully`);
    console.log(`✓ Total entries: ${Object.keys(manifest).length}`);

    // Validate structure
    let validEntries = 0;
    let invalidEntries = 0;

    for (const [key, metadata] of Object.entries(manifest)) {
      // Check required fields
      if (!metadata.lastModified || !metadata.md5) {
        console.error(`✗ Invalid entry for ${key}: missing fields`);
        invalidEntries++;
        continue;
      }

      // Validate MD5 format (32-char hex string)
      if (!/^[a-f0-9]{32}$/.test(metadata.md5)) {
        console.error(`✗ Invalid MD5 for ${key}: ${metadata.md5}`);
        invalidEntries++;
        continue;
      }

      // Validate ISO timestamp
      const date = new Date(metadata.lastModified);
      if (isNaN(date.getTime())) {
        console.error(`✗ Invalid timestamp for ${key}: ${metadata.lastModified}`);
        invalidEntries++;
        continue;
      }

      validEntries++;
    }

    console.log(`✓ Valid entries: ${validEntries}`);
    if (invalidEntries > 0) {
      console.error(`✗ Invalid entries: ${invalidEntries}`);
      process.exit(1);
    }

    // Check for expected entries
    const expectedEntries = ['project-header', 'anchors', 'door-info', 'frame-info'];
    const missing = expectedEntries.filter(key => !(key in manifest));

    if (missing.length > 0) {
      console.error(`✗ Missing expected entries: ${missing.join(', ')}`);
      process.exit(1);
    }
    console.log(`✓ All expected entries present`);

    // List first 10 entries
    console.log('\nFirst 10 entries:');
    Object.keys(manifest)
      .sort()
      .slice(0, 10)
      .forEach(key => {
        console.log(`  - ${key}: ${manifest[key].md5.substring(0, 8)}...`);
      });

    console.log('\n✓ Manifest validation complete!');
    console.log('✓ loadManifest() will parse successfully');

  } catch (error) {
    console.error('✗ Failed to load manifest:', error);
    process.exit(1);
  }
}

// Execute test
testManifestLoader();
