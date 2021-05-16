import Hapi from '@hapi/hapi'
import {healthPluginName} from "../../controllers/health"
import PrismaProvider from "../../providers/prisma-provider"

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
