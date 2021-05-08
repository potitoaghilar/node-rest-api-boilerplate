import Hapi from '@hapi/hapi'
import {prismaPluginName} from "./prisma"
import {healthPluginName} from "./health"
import boom from '@hapi/boom'
import Utils from "../../helpers/utils"
import StateCodeRepository from "../../repositories/core/oauth2/state-code-repository"
import Oauth2Provider from "../../repositories/core/oauth2/oauth2-provider"
import AuthorizationRequest from "../../models/core/oauth2/authorization-request"
import ClientOAuth2 from "client-oauth2"
import TokenRepository from "../../repositories/core/oauth2/token-repository"
import fetch from "node-fetch";
import Profile from "../../models/core/oauth2/profile";
import {add} from "date-fns";
import StateIpBind from '../../models/core/oauth2/stateIpBind'
import SignedRequest from "../../models/core/oauth2/signed-request";
import TokenUserBind from "../../models/core/oauth2/token-user-bind";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
                    notes: 'Authorize a specific user.',
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
    const uri = (await Oauth2Provider.getClient()).code.getUri({ state })

    // Generate StateIpBind
    const stateIpBind = new StateIpBind()
    stateIpBind.state = state
    stateIpBind.ip = request.info.remoteAddress

    // Save state for future check
    // TODO Implement some logic to remove expired token from Token table
    await StateCodeRepository.addStateCode(stateIpBind)

    return h.response({ authUrl: uri }).code(200)
}

async function authorizationHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    // Check if requested scopes matches
    const oauthProvider = await Oauth2Provider.getInstance()
    const scopes = oauthProvider.getOpenidConfig().scopes_supported
    const scopesCheck = request.query.scope.split(' ').every((scope: string) => scopes.includes(scope))
    if (!scopesCheck) {
        return boom.forbidden()
    }

    // Check if state is valid
    const stateIpBind = new StateIpBind()
    stateIpBind.state = request.query.state
    stateIpBind.ip = request.info.remoteAddress
    if (!await StateCodeRepository.checkStateCodeValidation(stateIpBind)) {
        // State and IP doesn't match
        return boom.forbidden()
    }

    // Remove state from valid states
    await StateCodeRepository.removeStateCode(stateIpBind)

    // Exchange code with session and refresh tokens
    let oauthToken: ClientOAuth2.Token
    try {
        oauthToken = await ((await Oauth2Provider.getClient()).code.getToken(request.url.href))
    } catch (e) {
        console.error(e)
        return boom.forbidden('Failed to get secure token from authorization server.')
    }

    // Get user info from authorization server
    const signedRequest = await oauthToken.sign<SignedRequest>({
        method: 'GET',
        url: Oauth2Provider.getUserInfoEndpoint(),
    })
    const userInfo = await fetch(signedRequest.url, {
        method: signedRequest.method,
        headers: (signedRequest.headers || { }) as any
    })
    const profile = Profile.fromJSON<Profile>(await userInfo.json()) as Profile

    // TODO Implement some logic to remove expired token from Token table
    // Save token, refresh token and expiration date to database
    await TokenRepository.saveTokenUserBind(profile.getUserId(), oauthToken)

    // Exit if JWT secret is not set
    if (!process.env.JWT_SECRET) {
        console.error('ERROR: JWT secret not set')
        return { isValid: false, response: boom.badImplementation() }
    }

    const jwtToken = jwt.sign({
        user: profile,
        accessToken: oauthToken.accessToken
    }, process.env.JWT_SECRET)

    // Send back access token to user
    return h.response({ token: jwtToken })
}

export {
    oauthPluginName,
    oath2plugin
}
