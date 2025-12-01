import type { FormSpec, TemplateManifest } from './types';
import type { ProjectStandards } from '../standards/types';
import { applyStandardsToForm } from '../standards/service';

// In-memory cache for runtime-loaded templates
const runtimeCache = new Map<string, FormSpec>();
let manifestCache: TemplateManifest | null = null;

/**
 * Load form template by ID (hybrid static + runtime)
 * @param templateId - Form template identifier (e.g., 'project-header')
 * @returns Form specification or null if not found
 */
export async function loadFormTemplate(templateId: string): Promise<FormSpec | null> {
  // Check runtime cache first
  if (runtimeCache.has(templateId)) {
    return runtimeCache.get(templateId)!;
  }

  // Load from public folder
  try {
    const response = await fetch(`/form-templates/${templateId}.json`);
    if (!response.ok) {
      console.warn(`Template not found: ${templateId}`);
      return null;
    }
    const spec: FormSpec = await response.json();

    // Validate structure
    if (!spec.formId || !spec.sections) {
      console.error(`Invalid template structure: ${templateId}`);
      return null;
    }

    runtimeCache.set(templateId, spec);
    return spec;
  } catch (error) {
    console.error(`Failed to load template ${templateId}:`, error);
    return null;
  }
}

/**
 * Load manifest file containing all available templates
 */
export async function loadManifest(): Promise<TemplateManifest> {
  if (manifestCache) return manifestCache;

  try {
    const response = await fetch('/form-templates/manifest.json');
    if (!response.ok) return {};
    manifestCache = await response.json();
    return manifestCache!;
  } catch {
    return {};
  }
}

/**
 * Check if template exists without loading it
 */
export async function templateExists(templateId: string): Promise<boolean> {
  // Check cache first
  if (runtimeCache.has(templateId)) return true;

  // Check manifest
  const manifest = await loadManifest();
  return templateId in manifest;
}

/**
 * Get list of all available template IDs
 */
export async function getAllTemplateIds(): Promise<string[]> {
  const manifest = await loadManifest();
  return Object.keys(manifest);
}

/**
 * Clear runtime cache (useful for development/testing)
 */
export function clearTemplateCache(): void {
  runtimeCache.clear();
  manifestCache = null;
}

/**
 * Load form template with standards pre-applied
 * @param templateId - Form template identifier (e.g., 'door-info')
 * @param standards - Standards values to apply to form defaults
 * @returns Form specification with standards applied, or null if not found
 */
export async function loadFormTemplateWithStandards(
  templateId: string,
  standards: ProjectStandards
): Promise<FormSpec | null> {
  // Load base template
  const template = await loadFormTemplate(templateId);

  if (!template) {
    return null;
  }

  // Apply standards to template
  return applyStandardsToForm(template, standards);
}
