/**
 * LENS VERSIONS — Truth Engine™
 *
 * Update these constants manually when major changes are made to prompts
 * or the TI Constitution. Every Lens run reads from this file — never
 * hardcodes version strings.
 *
 * Versioning convention:
 *   promptVersion: increment when LENS_SYSTEM_PROMPT changes materially
 *   constitutionVersion: increment when new TI principles are ratified
 *   groundTruthSchemaVersion: increment when GroundTruth interface changes
 */

export const LENS_VERSIONS = {
  promptVersion: '1.1',          // Updated: Truth Engine™ Reasoning Boundary added
  modelVersion: 'gpt-4o-mini',
  constitutionVersion: '4.3',    // 69 principles ratified as of Jun 2026
  groundTruthSchemaVersion: '1.0',
} as const;

export type LensVersions = typeof LENS_VERSIONS;
