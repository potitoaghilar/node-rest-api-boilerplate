import Hapi from '@hapi/hapi'
import 'reflect-metadata'
import {swaggerPlugins} from "./core/plugins/swagger/swagger"
import registerBasicAuthStrategy from "./core/auth/basic-auth"
import {healthController} from "./core/controllers/health"
import {prisma} from "./core/plugins/prisma/prisma"
import {usersController} from "./controllers/users"
import {oath2plugin} from "./core/controllers/oauth2"
import Utils from "./helpers/utils"
import registerBearerTokenStrategy from "./core/auth/jwt-oauth";
require('dotenv').config()

/**
 * Environmental variables:
 *  - HOST
 *  - PORT
 *  - NODE_ENV
 *  - DATABASE_URL
 *  - OAUTH2_CLIENT_ID
 *  - OAUTH2_CLIENT_SECRET
 *  - JWT_SECRET
 *  - NODE_TLS_REJECT_UNAUTHORIZED
 */

const startTime = Date.now()
console.log('Starting server...')

const server: Hapi.Server = Hapi.server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
})

export async function start(): Promise<Hapi.Server> {

    // Auth strategies
    await registerBasicAuthStrategy(server)
    await registerBearerTokenStrategy(server)

    // Register application plugins
    await server.register([
        prisma,
        healthController,
        usersController,
        oath2plugin
    ], {
        routes: {
            prefix: '/api',
        }
    })

    // Register swagger endpoint
    if (Utils.isDev()) {
        await server.register(swaggerPlugins)
    }

    // Start server
    await server.start()

    console.log(`Total boot time: ${(Date.now() - startTime) / 1000} seconds`)
    console.log(`Server running on ${server.info.uri}`)

    return server
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})


start()
    .catch((err) => {
        console.log(err)
    })
