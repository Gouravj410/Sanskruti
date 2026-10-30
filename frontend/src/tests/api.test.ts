import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMediaUrl, geminiAuth } from '../services/api.ts';

test('formatMediaUrl correctly formats media paths', () => {
  // Empty or null
  assert.equal(formatMediaUrl(''), '');
  assert.equal(formatMediaUrl(null), '');
  assert.equal(formatMediaUrl(undefined), '');

  // Full remote URLs preserved
  assert.equal(formatMediaUrl('https://example.com/art.jpg'), 'https://example.com/art.jpg');
  assert.equal(formatMediaUrl('http://example.com/art.jpg'), 'http://example.com/art.jpg');

  // Relative local asset paths
  const relative = formatMediaUrl('images/art-forms/madhubani.jpg');
  assert.ok(relative.endsWith('images/art-forms/madhubani.jpg'));

  // Leading slash handled safely
  const leadingSlash = formatMediaUrl('/images/art-forms/warli.jpg');
  assert.ok(leadingSlash.endsWith('images/art-forms/warli.jpg'));
});

test('geminiAuth does not store keys in client storage', () => {
  // Insecure localStorage credential storage has been eliminated
  assert.equal(geminiAuth.getKey(), '');
  assert.equal(geminiAuth.isConnected(), false);
});
