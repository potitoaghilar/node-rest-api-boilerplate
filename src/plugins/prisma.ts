import Hapi from '@hapi/hapi'
import { PrismaClient } from '@prisma/client'
import {healthPluginName} from "./health";
import Utils from "../helpers/utils";

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma: PrismaClient
    }
}

const prismaPluginName = 'core/prisma'

const prisma: Hapi.Plugin<undefined> = {
    name: prismaPluginName,
    dependencies: [healthPluginName],
    register: (server: Hapi.Server) => {
        
        server.app.prisma = new PrismaClient({
            log: Utils.isDev() ? ['error', 'warn', 'query'] : []
        })

        server.ext({
            type: 'onPostStop',
            method: async (server: Hapi.Server) => {
                server.app.prisma.$disconnect()
            },
        })

    }
}

export {
    prismaPluginName,
    prisma
}
