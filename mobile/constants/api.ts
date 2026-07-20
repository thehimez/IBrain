// XandaCross API base URL.
// The web frontend (port 5000) proxies /api/* to the XandaCross API (port 3001),
// so pointing the mobile app at the main dev domain works for all API routes.
//
// Override with EXPO_PUBLIC_API_URL env var for custom deployments.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://5ef68902-5a2c-4143-a8ff-d604b2c82451-00-28l4sy50bthr6.sisko.replit.dev';

export const API_ENDPOINTS = {
  me: '/api/auth/me',
  logout: '/api/auth/logout',
  googleAuth: '/api/auth/google',
  chat: '/api/chat',
  upload: '/api/upload',
  files: '/api/files',
  graph: '/api/graph',
  brainStatus: '/api/brain/status',
} as const;

// Supported text file types for upload
export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
};
