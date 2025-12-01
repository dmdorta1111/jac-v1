import type { ProjectStandards, StandardsState } from './types';
import type { FormSpec } from '../form-templates/types';
import { getStandardsDefaults } from './defaults';

/**
 * Load project-specific standards from API
 * @param projectPath - Project path (e.g., "project-docs/SDI/12345")
 * @returns Project standards or empty object if not found
 */
export async function loadProjectStandards(projectPath: string): Promise<ProjectStandards> {
  try {
    const response = await fetch(
      `/api/project-standards?projectPath=${encodeURIComponent(projectPath)}`
    );

    if (!response.ok) {
      // Return empty object if project standards don't exist yet
      if (response.status === 404) {
        return {};
      }
      throw new Error(`Failed to load project standards: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown error loading project standards');
    }

    return data.standards || {};
  } catch (error) {
    console.error('Error loading project standards:', error);
    // Return empty object on error (graceful degradation)
    return {};
  }
}

/**
 * Get merged standards (project values override defaults)
 * @param projectPath - Project path
 * @returns Merged standards
 */
export async function getMergedStandards(projectPath: string): Promise<ProjectStandards> {
  try {
    const [defaults, project] = await Promise.all([
      getStandardsDefaults(),
      loadProjectStandards(projectPath),
    ]);

    // Project-specific values override defaults
    return {
      ...defaults,
      ...project,
    };
  } catch (error) {
    console.error('Error getting merged standards:', error);
    // Return defaults only if merge fails
    try {
      return await getStandardsDefaults();
    } catch (defaultsError) {
      console.error('Error loading defaults fallback:', defaultsError);
      return {};
    }
  }
}

/**
 * Apply standards values to form specification
 * @param formSpec - Original form specification
 * @param standards - Standards values to apply
 * @returns New form specification with applied standards
 */
export function applyStandardsToForm(
  formSpec: FormSpec,
  standards: ProjectStandards
): FormSpec {
  // Create immutable copy with updated defaultValues
  return {
    ...formSpec,
    sections: formSpec.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        // Only apply if field name exists in standards
        if (field.name in standards) {
          return {
            ...field,
            defaultValue: standards[field.name] as
              | string
              | number
              | boolean
              | string[]
              | Date
              | undefined,
          };
        }
        // Return unchanged field
        return field;
      }),
    })),
  };
}

/**
 * Get complete standards state (defaults + project + merged)
 * @param projectPath - Project path
 * @returns Standards state with all three layers
 */
export async function getStandardsState(projectPath: string): Promise<StandardsState> {
  const [defaults, project] = await Promise.all([
    getStandardsDefaults(),
    loadProjectStandards(projectPath),
  ]);

  return {
    defaults,
    project,
    merged: { ...defaults, ...project },
  };
}
