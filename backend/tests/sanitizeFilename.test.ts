import { sanitizeFilename } from '../src/utils/sanitizeFilename';

describe('sanitizeFilename', () => {
  it('should remove illegal path characters like / \\ : * ? " < > |', () => {
    const title = 'Awesome Video: 4K/60fps "Test"? <Yes> | High';
    const clean = sanitizeFilename(title, 'mp4');
    expect(clean).not.toMatch(/[/:*?"<>|]/);
    expect(clean.endsWith('.mp4')).toBe(true);
  });

  it('should prevent path traversal sequences like ../ and ..\\', () => {
    const title = '../../etc/passwd';
    const clean = sanitizeFilename(title, 'mp4');
    expect(clean).not.toContain('..');
    expect(clean).not.toContain('/');
  });

  it('should handle Windows drive letter paths safely', () => {
    const title = 'C:\\Windows\\System32\\cmd.exe';
    const clean = sanitizeFilename(title, 'mp4');
    expect(clean).not.toContain(':\\');
  });

  it('should truncate excessively long titles', () => {
    const longTitle = 'a'.repeat(200);
    const clean = sanitizeFilename(longTitle, 'mp4');
    expect(clean.length).toBeLessThanOrEqual(110);
  });

  it('should provide fallback for empty string or invalid inputs', () => {
    const clean = sanitizeFilename('', 'mp3');
    expect(clean).toMatch(/(media|download)_\d+\.mp3/);
  });
});
