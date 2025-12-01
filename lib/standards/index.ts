/**
 * Standards Service - Project Standards Autofill System
 *
 * Exports types and functions for working with project standards:
 * - Load defaults from stds-form.json
 * - Load project-specific standards from API
 * - Apply standards to form templates
 */

export type { ProjectStandards, StandardsState, StandardsFieldDef } from './types';
export { getStandardsDefaults, clearDefaultsCache } from './defaults';
export {
  loadProjectStandards,
  getMergedStandards,
  applyStandardsToForm,
  getStandardsState,
} from './service';
