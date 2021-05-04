import Hapi from '@hapi/hapi'
import {prismaPluginName} from "./prisma";
import {healthPluginName} from "./health";
import boom from '@hapi/boom'
import Utils from "../helpers/utils";

const oauthPluginName = 'core/oauth2'
const controllerName = 'OAuth2Controller'

const oath2plugin: Hapi.Plugin<undefined> = {
    name: oauthPluginName,
    dependencies: [healthPluginName, prismaPluginName],
    register: (server: Hapi.Server) => {
        server.route([
            {
                method: 'GET',
                path: '/oauth2/authenticate',
                handler: authenticationHandler,
                options: {
                    description: 'Get authentication URL',
                    notes: 'Get OAuth2 authorization URL to begin authorization process for a specific user.',
                    tags: ['api', controllerName]
                }
            },
            {
                method: 'POST',
                path: '/oauth2/authorize',
                handler: authorizationHandler,
                options: {
                    description: 'Authorize user',
                    notes: 'Authorize a specific user.',
                    tags: ['api', controllerName]
                }
            },
        ])

        // Show client id and client secret for debug purposes
        if (Utils.isDev()) {
            server.route({
                method: 'GET',
                path: '/oauth2/debug',
                handler: debugHandler,
                options: {
                    description: 'Get OAuth2 client info',
                    notes: 'Get OAuth2 client info for debug purposes.',
                    tags: ['api', controllerName]
                }
            })
        }

    },
}

async function debugHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return h.response({ clientId: process.env.OAUTH2_CLIENT_ID, clientSecret: process.env.OAUTH2_CLIENT_SECRET }).code(200)
}

async function authenticationHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return boom.notImplemented()
}

async function authorizationHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return boom.notImplemented()
}

export {
    oauthPluginName,
    oath2plugin
}
