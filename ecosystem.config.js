const dotenv = require('dotenv')
dotenv.config()

const appName = process.env.APP_NAME || 'bd-cities-api-undefined'

module.exports = {
    apps: [
        {
            name: appName, // Name of your app
            script: './server.js', // Path to your Fastify entry file (server.js or app.js)
            interpreter: 'node', // Interpreter path
            watch: true, // Enable watch mode
            ignore_watch: ['node_modules', 'logs', 'public'], // Ignore unnecessary directories
            watch_options: {
                followSymlinks: false,
                usePolling: true,
            },
        },
    ],
}
