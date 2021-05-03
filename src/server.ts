import Hapi from '@hapi/hapi'
import healthController from "./plugins/health"
import usersController from "./plugins/users"
import 'reflect-metadata';
import {swaggerPlugins} from "./swagger/swagger-service";
import prisma from "./plugins/prisma";
import {basicAuth, basicAuthValidation} from "./auth/basic-auth";

/**
 * Environmental variables:
 *  - HOST: localhost
 *  - PORT: 3000
 *  - NODE_ENV: "production" | "<empty>"
 *  - DATABASE_URL
 */

const server: Hapi.Server = Hapi.server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
})

export async function start(): Promise<Hapi.Server> {

    await server.register(basicAuth);
    server.auth.strategy('basicAuth', 'basic', { validate: basicAuthValidation });

    // Register application plugins
    await server.register([
        healthController,
        prisma,
        usersController
    ], {
        routes: {
            prefix: '/api'
        }
    })

    // Register swagger endpoint
    if (process.env.NODE_ENV !== 'production') {
        await server.register(swaggerPlugins);
    }

    // Start server
    await server.start()
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
