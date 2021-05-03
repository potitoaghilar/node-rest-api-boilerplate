import Hapi from '@hapi/hapi'
import { PrismaClient } from '@prisma/client'

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma: PrismaClient
    }
}

const prisma: Hapi.Plugin<undefined> = {
    name: 'prisma',
    dependencies: ['healthCheck'],
    register: (server: Hapi.Server) => {
        
        server.app.prisma = new PrismaClient({
            log: process.env.NODE_ENV !== 'production' ? ['error', 'warn', 'query'] : []
        })

        server.ext({
            type: 'onPostStop',
            method: async (server: Hapi.Server) => {
                server.app.prisma.$disconnect()
            },
        })

    }
}

export default prisma
