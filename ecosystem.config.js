// pm2 stop 0 && pm2 start ecosystem.config.js --env dev && pm2 logs 0

module.exports = {
  apps: [{
    name: "EXP_Monitoring_Client_Server",
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch: ["node_modules", "file_storage"],
    env: {
      PORT: 4097,
      LOGS_FORMAT: "dev",
      JWT_SECRET: "secret",
      THE_KEY_V1: 'klapaucius',
    },
    env_dev: {
      NODE_ENV: "dev",
    },
    env_prod: {
      NODE_ENV: "prod",
    },
  }],
};
