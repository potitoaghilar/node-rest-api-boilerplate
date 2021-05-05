import Hapi from '@hapi/hapi'
import {prismaPluginName} from "./prisma"
import {healthPluginName} from "./health"
import boom from '@hapi/boom'
import Utils from "../helpers/utils"
import StateCodeRepository from "../repositories/state-code-repository"
import Oauth2Provider from "../repositories/core/oauth2/oauth2-provider"
import Joi from "joi";
import AuthorizationRequest from "../models/core/oauth2/authorization-request"
import ClientOAuth2 from "client-oauth2"
import TokenRepository from "../repositories/core/oauth2/token-repository"
import fetch from "node-fetch";
import Profile from "../models/core/oauth2/profile";
import {add} from "date-fns";

const crypto = require('crypto')
const oauthPluginName = 'core/oauth2'
const controllerName = 'OAuth2Controller'

const oath2plugin: Hapi.Plugin<undefined> = {
    name: oauthPluginName,
    dependencies: [healthPluginName, prismaPluginName],
    register: (server: Hapi.Server) => {
        server.route([
            {
                method: 'GET',
                path: '/oauth/authenticate',
                handler: authenticationHandler,
                options: {
                    description: 'Get authentication URL',
                    notes: 'Get OAuth2 authorization URL to begin authorization process for a specific user.',
                    tags: ['api', controllerName]
                }
            },
            {
                method: 'GET',
                path: '/oauth/authorize',
                handler: authorizationHandler,
                options: {
                    description: 'Authorize user',
                    notes: 'Authorize a specific user. Do not use in Swagger, this will perform a redirect.',
                    tags: ['api', controllerName],
                    validate: {
                        query: AuthorizationRequest.getValidator()
                    }
                }
            },
        ])

        // Show client id and client secret for debug purposes
        if (Utils.isDev()) {
            server.route({
                method: 'GET',
                path: '/oauth/debug',
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

    // Generate a random state
    // Track valid states to avoid CSRF attacks
    const state = crypto.randomBytes(20).toString('hex')

    // Get authentication URI
    const uri = Oauth2Provider.getInstance().code.getUri({ state })

    // Save state for future check
    // TODO Implement some logic to remove expired token from Token table
    await StateCodeRepository.addStateCode(state, request.info.remoteAddress)

    return h.response({ authUrl: uri }).code(200)
}

async function authorizationHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const state = request.query.state
    const ip = request.info.remoteAddress

    // Check if state is valid
    if (!await StateCodeRepository.checkStateCodeValidation(state, ip)) {
        // State and IP doesn't match
        return boom.forbidden()
    }

    // Remove state from valid states
    await StateCodeRepository.removeStateCode(state, ip)

    // Exchange code with session and refresh tokens
    let oauthToken: ClientOAuth2.Token
    try {
        oauthToken = (await Oauth2Provider.getInstance().code.getToken(request.url))
    } catch (e) {
        return boom.forbidden('Token expired. Login again')
    }

    // Get user id from authorization server
    const signedRequest = await oauthToken.sign({
        method: 'GET',
        url: Oauth2Provider.getUserInfoEndpoint(),
        headers: { }
    })
    const userInfo = await fetch(signedRequest.url, {
        method: signedRequest.method,
        headers: signedRequest.headers
    })
    const profile = Profile.parseJSON<Profile>(await userInfo.json())

    // Check if previous

    // TODO Implement some logic to remove expired token from Token table
    // Save token and refresh token to database
    await TokenRepository.saveTokenUserBind(profile.getUserId(), oauthToken.accessToken, oauthToken.refreshToken, add(new Date(), { seconds: parseInt(oauthToken.data.expires_in) }))

    // Redirect to home
    console.log('HERE')
    const authorizedRedirect = oauthToken.sign({
        method: 'GET',
        url: '/',
        headers: { Authorization: '' }
    })
    console.log(authorizedRedirect)
    return h.redirect(authorizedRedirect.url).header('Authorization', authorizedRedirect.headers.Authorization)
}

export {
    oauthPluginName,
    oath2plugin
}
