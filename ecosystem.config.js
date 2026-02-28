module.exports = {
  apps: [
    {
      name: 'clawdbot-dashboard-backend',
      cwd: '/Users/tonyye/Projects/clawdbot-dashboard/backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      log_file: '/Users/tonyye/Projects/clawdbot-dashboard/logs/backend.log',
      out_file: '/Users/tonyye/Projects/clawdbot-dashboard/logs/backend-out.log',
      error_file: '/Users/tonyye/Projects/clawdbot-dashboard/logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'clawdbot-dashboard-frontend',
      cwd: '/Users/tonyye/Projects/clawdbot-dashboard/frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development'
      },
      log_file: '/Users/tonyye/Projects/clawdbot-dashboard/logs/frontend.log',
      out_file: '/Users/tonyye/Projects/clawdbot-dashboard/logs/frontend-out.log',
      error_file: '/Users/tonyye/Projects/clawdbot-dashboard/logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
