const { generateSalt, hashPassword, validatePasswordComplexity } = require('../src/utils/auth.utils');

// ─────────────────────────────────────────────
// generateSalt
// ─────────────────────────────────────────────
describe('generateSalt', () => {
  test('returns a non-empty string', () => {
    const salt = generateSalt();
    expect(typeof salt).toBe('string');
    expect(salt.length).toBeGreaterThan(0);
  });

  test('returns a hex string (only 0-9 and a-f)', () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[0-9a-f]+$/);
  });

  test('two calls produce different salts', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });
});

// ─────────────────────────────────────────────
// hashPassword
// ─────────────────────────────────────────────
describe('hashPassword', () => {
  test('returns a non-empty string', () => {
    const hash = hashPassword('MyPassword@1', 'somesalt');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  test('same password and salt always produce the same hash', () => {
    const hash1 = hashPassword('MyPassword@1', 'fixedsalt');
    const hash2 = hashPassword('MyPassword@1', 'fixedsalt');
    expect(hash1).toBe(hash2);
  });

  test('same password with different salts produce different hashes', () => {
    const hash1 = hashPassword('MyPassword@1', 'salt_one');
    const hash2 = hashPassword('MyPassword@1', 'salt_two');
    expect(hash1).not.toBe(hash2);
  });

  test('different passwords with the same salt produce different hashes', () => {
    const hash1 = hashPassword('PasswordA@1', 'samesalt');
    const hash2 = hashPassword('PasswordB@1', 'samesalt');
    expect(hash1).not.toBe(hash2);
  });

  test('output is a 64-character hex string (SHA-256)', () => {
    const hash = hashPassword('MyPassword@1', 'somesalt');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ─────────────────────────────────────────────
// validatePasswordComplexity  (FR-102)
// ─────────────────────────────────────────────
describe('validatePasswordComplexity', () => {
  test('accepts a strong password and returns no errors', () => {
    const errors = validatePasswordComplexity('Secure@99');
    expect(errors).toHaveLength(0);
  });

  test('rejects a password shorter than 8 characters', () => {
    const errors = validatePasswordComplexity('Ab@1');
    expect(errors.some(e => e.includes('8 characters'))).toBe(true);
  });

  test('rejects a password with no uppercase letter', () => {
    const errors = validatePasswordComplexity('secure@99');
    expect(errors.some(e => e.includes('uppercase'))).toBe(true);
  });

  test('rejects a password with no digit', () => {
    const errors = validatePasswordComplexity('Secure@pass');
    expect(errors.some(e => e.includes('digit'))).toBe(true);
  });

  test('rejects a password with no special character', () => {
    const errors = validatePasswordComplexity('Secure99');
    expect(errors.some(e => e.includes('special'))).toBe(true);
  });

  test('rejects an empty password', () => {
    const errors = validatePasswordComplexity('');
    expect(errors.length).toBeGreaterThan(0);
  });

  test('reports multiple violations at once', () => {
    // all lowercase, no digits, no special char, too short
    const errors = validatePasswordComplexity('abc');
    expect(errors.length).toBeGreaterThan(1);
  });
});
