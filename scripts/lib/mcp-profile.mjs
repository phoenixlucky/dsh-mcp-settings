/**
 * Shared readers for a DSH profile's MCP configuration.
 *
 * Three scripts used to carry their own copies of the credential and patch readers; a drift in
 * any one of them would silently change what "the configured servers" means. This module is the
 * single place that turns a profile directory into server rows and credential references.
 *
 * The parsers are deliberately narrow: they read the flat `refs:` map of the credential document
 * and the managed `- id:` rows this bundle writes. Anything else is ignored rather than guessed.
 *
 * Values are returned to callers; they are never logged here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

/** Profile inspected when a script is given no explicit directory. */
export const DEFAULT_PROFILE_DIR = join(homedir(), '.dsh', 'profiles', 'web');

/**
 * Resolve the files that make up one profile's MCP configuration.
 * @param {string} profileDir - Absolute profile directory.
 * @returns {{dir: string, patch: string, credentials: string}} file locations.
 */
export function profilePaths(profileDir) {
  return {
    dir: profileDir,
    patch: join(profileDir, 'cordis.patch.yml'),
    credentials: join(profileDir, '..', '..', '.credentials.yaml'),
  };
}

/**
 * Read the flat `refs:` map of the credential document.
 * @param {string} text - Credentials YAML.
 * @returns {Record<string, string>} reference name to secret value.
 */
export function readRefs(text) {
  const refs = {};
  let inRefs = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^refs:\s*$/.test(line)) { inRefs = true; continue; }
    if (/^[A-Za-z0-9_]+:\s*$/.test(line)) { inRefs = false; continue; }
    if (!inRefs) continue;
    const match = line.match(/^\s+([A-Za-z0-9_]+):\s*(.+?)\s*$/);
    if (match) refs[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return refs;
}

/**
 * Read the credential references of one profile.
 * @param {string} profileDir - Absolute profile directory.
 * @returns {Record<string, string>} reference name to secret value.
 */
export function readProfileRefs(profileDir) {
  return readRefs(readFileSync(profilePaths(profileDir).credentials, 'utf8'));
}

/**
 * Extract managed server rows from a Cordis patch file.
 *
 * A row starts at any `- <key>: <value>` list item, not only `- id:`, because the settings UI
 * serializes a record in its own key order — `- url:` first is normal. Nested maps such as
 * `headers`, `headerRefs`, and `envRefs` are collected one level deep; an inline `{}` or `[]`
 * becomes an empty container rather than a string.
 * @param {string} text - Patch YAML.
 * @returns {Array<Record<string, unknown>>} managed rows.
 */
export function readManagedServers(text) {
  const servers = [];
  let current;
  let section = null;
  let sectionIndent = -1;
  /** Apply one `key: value` pair to the current row, tracking the open nested section. */
  const applyPair = (indent, key, rawValue) => {
    if (current === undefined) return;
    if (rawValue === '') { section = key; sectionIndent = indent; current[key] ??= {}; return; }
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    if (section !== null && indent > sectionIndent) { current[section][key] = value; return; }
    section = null;
    if (value === '{}') current[key] = {};
    else if (value === '[]') current[key] = [];
    else current[key] = value;
  };

  for (const line of text.split(/\r?\n/)) {
    if (/^\s*#/.test(line) || line.trim() === '') continue;
    const item = line.match(/^(\s*)-\s+(.*?)\s*$/);
    if (item) {
      const indent = item[1].length;
      current = {};
      servers.push(current);
      section = null;
      const firstPair = item[2].match(/^([A-Za-z_][\w-]*):\s*(.*?)\s*$/);
      if (firstPair) applyPair(indent, firstPair[1], firstPair[2]);
      continue;
    }
    if (current === undefined) continue;
    const indent = line.length - line.trimStart().length;
    const pair = line.match(/^\s*([A-Za-z_][\w-]*):\s*(.*?)\s*$/);
    if (!pair) continue;
    applyPair(indent, pair[1], pair[2]);
  }
  return servers.filter((row) => row.transport === 'streamable-http' || row.transport === 'stdio');
}

/**
 * Read the managed server rows of one profile.
 * @param {string} profileDir - Absolute profile directory.
 * @returns {Array<Record<string, unknown>>} managed rows.
 */
export function readProfileServers(profileDir) {
  return readManagedServers(readFileSync(profilePaths(profileDir).patch, 'utf8'));
}
