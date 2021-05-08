import Hapi from '@hapi/hapi'
import {healthPluginName} from "./health"
import PrismaProvider from "../../repositories/core/prisma/prisma-provider"

const prismaPluginName = 'core/prisma'

const prisma: Hapi.Plugin<undefined> = {
    name: prismaPluginName,
    dependencies: [healthPluginName],
    register: (server: Hapi.Server) => {

        PrismaProvider.init()

        server.ext({
            type: 'onPostStop',
            method: async (server: Hapi.Server) => {
                PrismaProvider.getClient().$disconnect()
            },
        })

    }
}

export {
    prismaPluginName,
    prisma
}
