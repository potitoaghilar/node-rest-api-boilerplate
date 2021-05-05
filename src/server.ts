import Hapi from '@hapi/hapi'
import 'reflect-metadata'
import {swaggerPlugins} from "./swagger/swagger-service"
import {basicAuth, basicAuthValidation} from "./auth/basic-auth"
import {healthController} from "./plugins/health"
import {prisma} from "./plugins/prisma"
import {usersController} from "./plugins/users"
import {oath2plugin} from "./plugins/oauth2"
import Utils from "./helpers/utils"
import {paginatorPlugin} from "./plugins/paginator"
require('dotenv').config()

/**
 * Environmental variables:
 *  - HOST: localhost
 *  - PORT: 3000
 *  - NODE_ENV: "production" | "dev"
 *  - DATABASE_URL
 */

const startTime = Date.now()
console.log('Starting server...')

const server: Hapi.Server = Hapi.server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
})

export async function start(): Promise<Hapi.Server> {

    // TODO improve. Now used only for swagger
    // Registering basic auth
    await server.register(basicAuth)
    server.auth.strategy('basicAuth', 'basic', { validate: basicAuthValidation })

    // Register application plugins
    await server.register([
        prisma,
        paginatorPlugin,
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
