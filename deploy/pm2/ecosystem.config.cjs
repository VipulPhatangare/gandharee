module.exports = {
  apps: [
    {
      name: 'gandharree-backend',
      cwd: '/var/www/gandharree/backend',
      script: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 7117,
      },
      error_file: '/var/log/gandharree/backend-error.log',
      out_file: '/var/log/gandharree/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
