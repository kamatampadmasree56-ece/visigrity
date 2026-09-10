/**
 * Utility functions for hash generation and display.
 * These are deterministic demo hashes only — not cryptographically secure.
 */

/**
 * Generate a deterministic demo SHA-256-style hash from a seed string.
 */
export function generateDemoHash(seed: string): string {
  // Simple deterministic hash for demo purposes only
  let hash = 0;
  const chars = 'abcdef0123456789';
  const fullSeed = seed + 'visigrity-demo-salt';
  for (let i = 0; i < fullSeed.length; i++) {
    const char = fullSeed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Convert to a 64-char hex string deterministically
  let result = '';
  let current = Math.abs(hash);
  for (let i = 0; i < 64; i++) {
    const seedByte = fullSeed.charCodeAt(i % fullSeed.length);
    const combined = (current + seedByte + i * 31) % 16;
    result += chars[combined];
    current = Math.abs((current * 1103515245 + 12345) | 0);
  }
  return result;
}

/**
 * Alias for use across the app
 */
export function generateHash(seed: string): string {
  return generateDemoHash(seed);
}

/**
 * Truncate a hash for display purposes.
 */
export function truncateHash(hash: string, chars = 16): string {
  if (!hash || hash.length <= chars) return hash;
  return `${hash.slice(0, chars)}...`;
}

/**
 * Format a full hash for display with separators.
 */
export function formatHash(hash: string): string {
  if (!hash) return '';
  return hash.match(/.{1,8}/g)?.join(' ') ?? hash;
}
