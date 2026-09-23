import { JobManager } from '../src/services/jobManager';

describe('JobManager', () => {
  const sampleJobId = 'test-job-1234';

  afterEach(() => {
    JobManager.deleteJob(sampleJobId);
  });

  test('should create and retrieve a download job', () => {
    const job = JobManager.createJob(sampleJobId, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'mp4', 1080);
    expect(job).toBeDefined();
    expect(job.id).toBe(sampleJobId);
    expect(job.status).toBe('queued');
    expect(job.progress).toBe(0);

    const retrieved = JobManager.getJob(sampleJobId);
    expect(retrieved).toEqual(job);
  });

  test('should update job status, speed, and progress', () => {
    JobManager.createJob(sampleJobId, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'mp4', 1080);

    const updated = JobManager.updateJob(sampleJobId, {
      status: 'downloading',
      progress: 45,
      speed: '3.50MiB/s',
      eta: '00:10'
    });

    expect(updated?.status).toBe('downloading');
    expect(updated?.progress).toBe(45);
    expect(updated?.speed).toBe('3.50MiB/s');
    expect(updated?.eta).toBe('00:10');
  });

  test('should fail a job with error message', () => {
    JobManager.createJob(sampleJobId, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'mp4', 1080);
    JobManager.failJob(sampleJobId, 'Test error message');

    const job = JobManager.getJob(sampleJobId);
    expect(job?.status).toBe('failed');
    expect(job?.error).toBe('Test error message');
  });

  test('should cancel an ongoing job', () => {
    JobManager.createJob(sampleJobId, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'mp4', 1080);
    const result = JobManager.cancelJob(sampleJobId);

    expect(result).toBe(true);
    const job = JobManager.getJob(sampleJobId);
    expect(job?.status).toBe('failed');
    expect(job?.error).toContain('cancelled');
  });

  test('should return false when cancelling non-existent job', () => {
    const result = JobManager.cancelJob('non-existent-id');
    expect(result).toBe(false);
  });
});
