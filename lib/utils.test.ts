import { describe, it, expect } from 'vitest';
import { formatDate, slugifyTag } from '@/lib/utils';

// Validates: Requirements 14.1

describe('formatDate', () => {
  it('formats a date string and contains the year', () => {
    const result = formatDate('2024-01-15', 'en-US');
    expect(result).toContain('2024');
  });
});

describe('slugifyTag', () => {
  it('converts "Hello World!" to "hello-world"', () => {
    expect(slugifyTag('Hello World!')).toBe('hello-world');
  });

  it('trims surrounding spaces', () => {
    expect(slugifyTag('  spaces  ')).toBe('spaces');
  });

  it('is idempotent', () => {
    const once = slugifyTag('Hello World!');
    const twice = slugifyTag(once);
    expect(twice).toBe(once);
  });
});
