module.exports = {
  apps: [
    {
      name: 'cdc-growth-charts',
      cwd: './',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4002 -H 0.0.0.0',
      interpreter: '/home/manan/.local/node/current/bin/node',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4002,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};

