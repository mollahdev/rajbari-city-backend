const dotenv = require('dotenv')
dotenv.config()

const appName = process.env.APP_NAME || 'bd-cities-api-undefined'

module.exports = {
    apps: [
        {
            name: appName, // Name of your app
            script: './server.js', // Path to your Fastify entry file (server.js or app.js)
            watch: ['.'],
            ignore_watch: ['node_modules', 'logs', 'public'], // Ignore unnecessary directories
        },
    ],
}
