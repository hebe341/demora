module.exports = {
  apps : [
    {
      name: 'leidy-backend',
      script: './backend/src/index.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
