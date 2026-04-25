import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parsePost, getPostBySlug, getContentDirectory } from '@/lib/posts';

// Validates: Requirements 14.1

let tempFilename: string | null = null;

afterEach(() => {
  if (tempFilename) {
    const dir = getContentDirectory(undefined);
    const filePath = path.join(dir, tempFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    tempFilename = null;
  }
});

function writeTempPost(content: string): string {
  const filename = `_test-post-${Date.now()}.md`;
  const dir = getContentDirectory(undefined);
  fs.writeFileSync(path.join(dir, filename), content, 'utf8');
  tempFilename = filename;
  return filename;
}

describe('parsePost', () => {
  it('parses valid frontmatter into correct Post shape', () => {
    const filename = writeTempPost(`---
title: "Test Post"
slug: "test-post"
excerpt: "A test excerpt."
author: "Test Author"
date: "2024-01-15"
category: "Testing"
readTime: 5
featured: false
tags: [test, vitest]
---

This is the post content.
`);

    const post = parsePost(filename);

    expect(post.title).toBe('Test Post');
    expect(post.slug).toBe('test-post');
    expect(post.excerpt).toBe('A test excerpt.');
    expect(post.author).toBe('Test Author');
    expect(post.date).toBe('2024-01-15');
    expect(post.category).toBe('Testing');
    expect(post.readTime).toBe(5);
    expect(post.featured).toBe(false);
    expect(post.tags).toEqual(['test', 'vitest']);
    expect(typeof post.content).toBe('string');
    expect(typeof post.html).toBe('string');
  });

  it('throws an error containing filename and "title" when title is missing', () => {
    const filename = writeTempPost(`---
slug: "no-title"
excerpt: "Missing title."
author: "Author"
date: "2024-01-15"
category: "Test"
readTime: 3
featured: false
tags: []
---
Content here.
`);

    expect(() => parsePost(filename)).toThrowError(filename);
    expect(() => parsePost(filename)).toThrowError(/title/i);
  });

  it('throws an error containing filename and "slug" when slug is missing', () => {
    const filename = writeTempPost(`---
title: "No Slug Post"
excerpt: "Missing slug."
author: "Author"
date: "2024-01-15"
category: "Test"
readTime: 3
featured: false
tags: []
---
Content here.
`);

    expect(() => parsePost(filename)).toThrowError(filename);
    expect(() => parsePost(filename)).toThrowError(/slug/i);
  });
});

describe('getPostBySlug', () => {
  it('returns post with correct title for known slug "seo-fundamentals"', () => {
    const post = getPostBySlug('seo-fundamentals');
    expect(post).not.toBeNull();
    expect(post!.title).toBe("SEO Fundamentals: The Complete Beginner's Guide");
  });

  it('returns null for unknown slug "nonexistent-post"', () => {
    const result = getPostBySlug('nonexistent-post');
    expect(result).toBeNull();
  });
});
