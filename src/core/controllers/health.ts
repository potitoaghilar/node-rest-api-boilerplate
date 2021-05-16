
import Hapi, {ResponseToolkit} from '@hapi/hapi'

const healthPluginName = 'core/health'

const healthController: Hapi.Plugin<undefined> = {
    name: healthPluginName,
    register: (server: Hapi.Server) => {
        server.route({
            method: 'GET',
            path: '/health',
            handler: (_, h: ResponseToolkit) => {
                return h.response({ status: 'healthy' }).code(200)
            },
            options: {
                auth: false
            }
        })
    }
}

export {
    healthPluginName,
    healthController
}
