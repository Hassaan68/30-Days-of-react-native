import { evaluatePasswordStrength, loginSchema, signUpSchema } from './authSchemas';

describe('loginSchema', () => {
  it('accepts valid credentials and trims surrounding whitespace from email', () => {
    const result = loginSchema.safeParse({
      email: '  alex@example.com  ',
      password: 'SecurePass123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('alex@example.com');
    }
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'SecurePass123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((issue) => issue.path[0] === 'email');
      expect(emailIssue?.message).toBe('Enter a valid email address');
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'alex@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((issue) => issue.path[0] === 'password');
      expect(passwordIssue?.message).toContain('at least 8 characters');
    }
  });
});

describe('signUpSchema', () => {
  it('accepts a strong matching sign-up payload', () => {
    const result = signUpSchema.safeParse({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords on the confirmPassword field', () => {
    const result = signUpSchema.safeParse({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'SecurePass123',
      confirmPassword: 'DifferentPass123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find((issue) => issue.path[0] === 'confirmPassword');
      expect(confirmIssue?.message).toBe('Passwords do not match');
    }
  });

  it('enforces uppercase, lowercase, and numeric characters in passwords', () => {
    const result = signUpSchema.safeParse({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'alllowercasepassword',
      confirmPassword: 'alllowercasepassword',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordMessages = result.error.issues
        .filter((issue) => issue.path[0] === 'password')
        .map((issue) => issue.message);
      expect(passwordMessages).toContain('Password must include at least one uppercase letter');
      expect(passwordMessages).toContain('Password must include at least one number');
    }
  });
});

describe('evaluatePasswordStrength', () => {
  it('classifies weak, fair, good, and strong passwords accurately', () => {
    expect(evaluatePasswordStrength('abc')).toEqual({ score: 0, label: 'Weak' });
    expect(evaluatePasswordStrength('abcdefgh')).toEqual({ score: 1, label: 'Weak' });
    expect(evaluatePasswordStrength('Abcdefgh')).toEqual({ score: 2, label: 'Fair' });
    expect(evaluatePasswordStrength('Abcdefg1')).toEqual({ score: 3, label: 'Good' });
    expect(evaluatePasswordStrength('Str0ng!Pass2026')).toEqual({ score: 4, label: 'Strong' });
  });
});
