module.exports = {
    baseUrl: './',
    assetsDir: 'static',
    productionSourceMap: false,
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