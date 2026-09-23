import { validateYouTubeUrl } from '../src/utils/validateUrl';

describe('validateYouTubeUrl', () => {
  it('should accept valid standard YouTube watch URLs', () => {
    const res = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
    expect(res.sanitizedUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('should accept short youtube URLs (youtu.be)', () => {
    const res = validateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('should accept YouTube Shorts URLs', () => {
    const res = validateYouTubeUrl('https://www.youtube.com/shorts/abcdef12345');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('abcdef12345');
  });

  it('should reject non-YouTube URLs', () => {
    const res = validateYouTubeUrl('https://example.com/video');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Only supported YouTube domains');
  });

  it('should reject local IP/SSRF addresses', () => {
    const res1 = validateYouTubeUrl('http://127.0.0.1/watch?v=12345');
    expect(res1.isValid).toBe(false);

    const res2 = validateYouTubeUrl('http://localhost/watch?v=12345');
    expect(res2.isValid).toBe(false);

    const res3 = validateYouTubeUrl('http://192.168.1.1/watch?v=12345');
    expect(res3.isValid).toBe(false);
  });

  it('should reject file:// URLs', () => {
    const res = validateYouTubeUrl('file:///C:/Windows/system32');
    expect(res.isValid).toBe(false);
  });

  it('should reject empty or malformed input', () => {
    expect(validateYouTubeUrl('').isValid).toBe(false);
    expect(validateYouTubeUrl('not-a-url').isValid).toBe(false);
  });
});
