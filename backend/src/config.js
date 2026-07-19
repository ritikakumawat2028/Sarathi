import 'dotenv/config';

export const config = {
  // AWS Elastic Beanstalk forwards traffic to port 8080 by default.
  // Local development uses PORT=4000 set in .env which overrides this.
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sarathi-ai',

  dataGovInApiKey:
    process.env.DATA_GOV_IN_API_KEY ||
    '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
  dataGovInResourceIds: (process.env.DATA_GOV_IN_RESOURCE_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  myschemeApiBase: process.env.MYSCHEME_API_BASE || 'https://api.myscheme.gov.in/search/v5',
  myschemeFetchEnabled: (process.env.MYSCHEME_FETCH_ENABLED || 'true') === 'true',

  // Google Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  schemesCacheTtlSeconds: parseInt(process.env.SCHEMES_CACHE_TTL_SECONDS || '21600', 10),
  schemesRefreshCron: process.env.SCHEMES_REFRESH_CRON || '15 3 * * *',
};
