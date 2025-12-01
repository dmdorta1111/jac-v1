/**
 * Types for Project Standards Autofill System
 */

/**
 * Field definition extracted from standards form
 */
export interface StandardsFieldDef {
  name: string;
  type: string;
  defaultValue: unknown;
}

/**
 * Standards values (field name -> value mapping)
 */
export interface ProjectStandards {
  [fieldName: string]: unknown;
}

/**
 * Standards state with defaults, project-specific, and merged values
 */
export interface StandardsState {
  /** Default values from stds-form.json */
  defaults: ProjectStandards;
  /** User-saved project-specific values */
  project: ProjectStandards;
  /** Merged values (project overrides defaults) */
  merged: ProjectStandards;
}
