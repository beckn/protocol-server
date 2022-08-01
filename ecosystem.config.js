module.exports = {
    apps: [
        {
            name: "protocol-server",
            script: './dist/app.js',
            watch: true,
            instances: 3,
            exec_mode: "cluster",
        }
    ]
}