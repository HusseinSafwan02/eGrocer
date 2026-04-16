const crypto = require('crypto');

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// FR-102: password complexity rules
function validatePasswordComplexity(password) {
  const errors = [];
  if (!password || password.length < 8)
    errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password))
    errors.push('Password must include an uppercase letter');
  if (!/[0-9]/.test(password))
    errors.push('Password must include a digit');
  if (!/[^A-Za-z0-9]/.test(password))
    errors.push('Password must include a special character');
  return errors;
}

module.exports = { generateSalt, hashPassword, validatePasswordComplexity };
