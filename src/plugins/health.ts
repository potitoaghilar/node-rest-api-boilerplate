
import Hapi, {ResponseToolkit} from '@hapi/hapi'

const healthController: Hapi.Plugin<undefined> = {
    name: 'healthCheck',
    register: (server: Hapi.Server) => {
        server.route({
            method: 'GET',
            path: '/health',
            handler: (_, h: ResponseToolkit) => {
                return h.response({ status: 'HEALTHY' }).code(200)
            }
        });
    }
}

export default healthController;
