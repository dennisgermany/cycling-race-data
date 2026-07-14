#!/usr/bin/env node
/**
 * Canonical stage profile types for road races.
 *
 * Values: flat | hilly | mountain | ITT | TTT
 * `currentStage` keeps the trailing suffix (e.g. ", flat") for display and finish-time parsing.
 */

/** @type {readonly ["flat", "hilly", "mountain", "ITT", "TTT"]} */
export const STAGE_TYPES = ["flat", "hilly", "mountain", "ITT", "TTT"];

const TYPE_RE = /,\s*(flat|hilly|mountain|ITT|TTT)\s*$/i;

/**
 * @param {string | null | undefined} currentStage
 * @returns {"flat" | "hilly" | "mountain" | "ITT" | "TTT"}
 */
export function parseStageTypeFromCurrentStage(currentStage) {
  const m = String(currentStage ?? "").match(TYPE_RE);
  if (!m) return "flat";
  const token = m[1];
  if (/^itt$/i.test(token)) return "ITT";
  if (/^ttt$/i.test(token)) return "TTT";
  return /** @type {"flat" | "hilly" | "mountain"} */ (token.toLowerCase());
}

/**
 * @param {string | null | undefined} value
 * @returns {"flat" | "hilly" | "mountain" | "ITT" | "TTT" | null}
 */
export function normalizeStageType(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (/^itt$/i.test(s)) return "ITT";
  if (/^ttt$/i.test(s)) return "TTT";
  const lower = s.toLowerCase();
  if (lower === "flat" || lower === "hilly" || lower === "mountain") return lower;
  return null;
}

/**
 * @param {{ stageType?: string, currentStage?: string }} stage
 * @returns {"flat" | "hilly" | "mountain" | "ITT" | "TTT"}
 */
export function resolveStageType(stage) {
  return normalizeStageType(stage.stageType) ?? parseStageTypeFromCurrentStage(stage.currentStage);
}

/**
 * Lowercase key for speed tables (itt, ttt, flat, …).
 * @param {"flat" | "hilly" | "mountain" | "ITT" | "TTT"} type
 */
export function stageTypeSpeedKey(type) {
  if (type === "ITT") return "itt";
  if (type === "TTT") return "ttt";
  return type;
}

/**
 * @param {"flat" | "hilly" | "mountain" | "ITT" | "TTT"} type
 */
export function formatStageTypeSuffix(type) {
  return `, ${type}`;
}

/**
 * Ensure `currentStage` ends with the resolved type suffix.
 * @param {string} currentStage
 * @param {"flat" | "hilly" | "mountain" | "ITT" | "TTT"} type
 */
export function syncCurrentStageSuffix(currentStage, type) {
  const base = String(currentStage ?? "").replace(TYPE_RE, "").trimEnd();
  return `${base}${formatStageTypeSuffix(type)}`;
}
