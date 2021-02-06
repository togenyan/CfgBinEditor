const WorkerPlugin = require('worker-plugin')

module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer){
      config.plugins.push(
        new WorkerPlugin({
          globalObject: 'self'
        })
      )
    }
    return config
  }
}
