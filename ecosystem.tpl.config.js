module.exports = {
  apps : [{
    name: 'jibrel-com-web',
    cwd: '/app',
    script: './index.js',
    min_uptime: '5000',
    max_restarts: 5,
    instances : 'max',
    exec_mode : 'cluster'
  }],
}
