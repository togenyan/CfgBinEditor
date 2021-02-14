const WorkerPlugin = require('worker-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  basePath: '/Yokai/cfgbineditor',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer){
      config.plugins.push(
        new WorkerPlugin({
          globalObject: 'self'
        })
      )
    }
    return config
  },
})
