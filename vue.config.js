module.exports = {
    publicPath: './',
    assetsDir: 'static',
    productionSourceMap: false,
    parallel: false,
    devServer: {
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://localhost:17600',
                changeOrigin: true,
                ws: true
            }
        }
    }
}
