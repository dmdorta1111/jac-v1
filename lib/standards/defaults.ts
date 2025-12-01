import type { ProjectStandards } from './types';
import type { FormSpec } from '../form-templates/types';

/**
 * In-memory cache for standards defaults
 */
let defaultsCache: ProjectStandards | null = null;

/**
 * Extract default values from stds-form.json
 * @returns Object mapping field names to default values
 */
export async function getStandardsDefaults(): Promise<ProjectStandards> {
  // Return cached defaults if available
  if (defaultsCache) {
    return defaultsCache;
  }

  try {
    // Fetch stds-form.json from public folder
    const response = await fetch('/form-templates/stds-form.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch stds-form: ${response.statusText}`);
    }

    const formSpec: FormSpec = await response.json();

    // Extract defaults from all fields
    const defaults: ProjectStandards = {};

    formSpec.sections.forEach((section) => {
      section.fields.forEach((field) => {
        // Only include fields with default values
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          defaults[field.name] = field.defaultValue;
        }
      });
    });

    // Cache for subsequent calls
    defaultsCache = defaults;

    return defaults;
  } catch (error) {
    console.error('Error loading standards defaults:', error);
    throw new Error('Failed to load standards defaults');
  }
}

/**
 * Clear the defaults cache (useful for testing/development)
 */
export function clearDefaultsCache(): void {
  defaultsCache = null;
}
