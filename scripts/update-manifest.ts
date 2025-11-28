import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface TemplateMetadata {
  lastModified: string;
  md5: string;
}

type TemplateManifest = Record<string, TemplateMetadata>;

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'form-templates');
const MANIFEST_PATH = path.join(TEMPLATES_DIR, 'manifest.json');

/**
 * Generate MD5 hash for file content
 */
function generateMD5(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Scan directory for JSON template files
 */
function scanTemplates(): TemplateManifest {
  const manifest: TemplateManifest = {};

  // Read all files in templates directory
  const files = fs.readdirSync(TEMPLATES_DIR);

  // Filter for .json files, exclude manifest.json
  const templateFiles = files.filter(file =>
    file.endsWith('.json') && file !== 'manifest.json'
  );

  console.log(`Found ${templateFiles.length} template files`);

  // Process each template file
  for (const file of templateFiles) {
    const filePath = path.join(TEMPLATES_DIR, file);
    const stats = fs.statSync(filePath);
    const templateId = path.basename(file, '.json');

    // Calculate MD5 hash
    const md5 = generateMD5(filePath);

    // Create metadata entry
    manifest[templateId] = {
      lastModified: stats.mtime.toISOString(),
      md5: md5
    };
  }

  return manifest;
}

/**
 * Load existing manifest or return empty object
 */
function loadExistingManifest(): TemplateManifest {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Could not load existing manifest:', error);
  }
  return {};
}

/**
 * Compare manifests and log changes
 */
function logChanges(oldManifest: TemplateManifest, newManifest: TemplateManifest): void {
  const oldKeys = new Set(Object.keys(oldManifest));
  const newKeys = new Set(Object.keys(newManifest));

  let added = 0;
  let updated = 0;
  let unchanged = 0;
  let removed = 0;

  // Check for additions and updates
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      added++;
      console.log(`  + Added: ${key}`);
    } else if (oldManifest[key].md5 !== newManifest[key].md5) {
      updated++;
      console.log(`  ~ Updated: ${key}`);
    } else {
      unchanged++;
    }
  }

  // Check for removals
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      removed++;
      console.log(`  - Removed: ${key}`);
    }
  }

  console.log(`\nSummary: ${added} added, ${updated} updated, ${unchanged} unchanged, ${removed} removed`);
  console.log(`Total entries: ${newKeys.size}`);
}

/**
 * Write manifest with sorted keys
 */
function writeManifest(manifest: TemplateManifest): void {
  // Sort keys alphabetically
  const sortedManifest: TemplateManifest = {};
  const sortedKeys = Object.keys(manifest).sort();

  for (const key of sortedKeys) {
    sortedManifest[key] = manifest[key];
  }

  // Write formatted JSON with 2-space indent
  const content = JSON.stringify(sortedManifest, null, 2);
  fs.writeFileSync(MANIFEST_PATH, content + '\n', 'utf-8');

  console.log(`\nManifest written to: ${MANIFEST_PATH}`);
}

/**
 * Validate manifest structure
 */
function validateManifest(manifest: TemplateManifest): boolean {
  let valid = true;

  for (const [key, metadata] of Object.entries(manifest)) {
    // Check required fields
    if (!metadata.lastModified || !metadata.md5) {
      console.error(`Invalid entry for ${key}: missing required fields`);
      valid = false;
    }

    // Validate MD5 format (32-char hex string)
    if (!/^[a-f0-9]{32}$/.test(metadata.md5)) {
      console.error(`Invalid MD5 hash for ${key}: ${metadata.md5}`);
      valid = false;
    }

    // Validate ISO timestamp
    const date = new Date(metadata.lastModified);
    if (isNaN(date.getTime())) {
      console.error(`Invalid timestamp for ${key}: ${metadata.lastModified}`);
      valid = false;
    }
  }

  return valid;
}

/**
 * Main execution
 */
function main(): void {
  console.log('=== Updating Form Template Manifest ===\n');

  // Load existing manifest
  const oldManifest = loadExistingManifest();
  console.log(`Loaded existing manifest with ${Object.keys(oldManifest).length} entries\n`);

  // Scan templates directory
  console.log('Scanning templates directory...');
  const newManifest = scanTemplates();
  console.log('');

  // Log changes
  console.log('Changes:');
  logChanges(oldManifest, newManifest);

  // Validate manifest
  console.log('\nValidating manifest structure...');
  if (!validateManifest(newManifest)) {
    console.error('Manifest validation failed!');
    process.exit(1);
  }
  console.log('✓ Validation passed');

  // Write manifest
  writeManifest(newManifest);

  console.log('\n✓ Manifest update complete!');
}

// Execute
main();
