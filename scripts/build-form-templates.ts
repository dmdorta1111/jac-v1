import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface TemplateMetadata {
  lastModified: string;
  md5: string;
}

async function buildFormTemplates() {
  console.log('Building form templates...\n');

  const sourceDir = path.join(process.cwd(), 'folder-creation-data');
  const outputDir = path.join(process.cwd(), 'public', 'form-templates');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const manifest: Record<string, TemplateMetadata> = {};
  let processedCount = 0;

  try {
    const files = await fs.readdir(sourceDir);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const sourcePath = path.join(sourceDir, file);
      const content = await fs.readFile(sourcePath, 'utf-8');

      // Extract JSON from ```json-form blocks
      const jsonMatch = content.match(/```json-form\s*\n([\s\S]*?)\n```/);

      if (!jsonMatch) {
        console.warn(`No json-form block found in ${file}`);
        continue;
      }

      try {
        const formSpec = JSON.parse(jsonMatch[1]);
        const templateId = formSpec.formId || file.replace('.md', '');

        // Write JSON file
        const outputPath = path.join(outputDir, `${templateId}.json`);
        await fs.writeFile(outputPath, JSON.stringify(formSpec, null, 2));

        // Generate metadata
        const stats = await fs.stat(sourcePath);
        const md5 = crypto.createHash('md5').update(jsonMatch[1]).digest('hex');

        manifest[templateId] = {
          lastModified: stats.mtime.toISOString(),
          md5,
        };

        console.log(`Generated ${templateId}.json`);
        processedCount++;
      } catch (parseError) {
        console.error(`Failed to parse JSON in ${file}:`, parseError);
      }
    }

    // Write manifest
    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\nManifest created with ${processedCount} templates`);

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildFormTemplates();
