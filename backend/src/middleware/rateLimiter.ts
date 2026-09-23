import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const maxDownloads = parseInt(process.env.DOWNLOAD_RATE_LIMIT_MAX || '10', 10);
// Status polling hits this endpoint ~1x/second while a download is active,
// so it needs a much higher ceiling than the general API limiter.
const maxStatusRequests = parseInt(process.env.STATUS_RATE_LIMIT_MAX || '3000', 10);

export const apiRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

export const statusRateLimiter = rateLimit({
  windowMs,
  max: maxStatusRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many status checks. Please wait a moment before trying again.'
  }
});

export const downloadRateLimiter = rateLimit({
  windowMs,
  max: maxDownloads,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Download limit exceeded (max 10 downloads per 15 minutes). Please wait before requesting another download.'
  }
});
