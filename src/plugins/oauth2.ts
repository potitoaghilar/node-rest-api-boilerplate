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
import StateIpBind from '../models/core/oauth2/stateIpBind'
import SignedRequest from "../models/core/oauth2/signed-request";

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
    const uri = Oauth2Provider.getInstance().code.getUri({ state })

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

    const stateIpBind = new StateIpBind()
    stateIpBind.state = request.query.state
    stateIpBind.ip = request.info.remoteAddress

    // Check if state is valid
    if (!await StateCodeRepository.checkStateCodeValidation(stateIpBind)) {
        // State and IP doesn't match
        return boom.forbidden()
    }

    // Remove state from valid states
    await StateCodeRepository.removeStateCode(stateIpBind)

    // Exchange code with session and refresh tokens
    let oauthToken: ClientOAuth2.Token
    try {
        oauthToken = (await Oauth2Provider.getInstance().code.getToken(request.url))
    } catch (e) {
        return boom.forbidden('Token expired. Login again')
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
    const profile = Profile.fromJSON<Profile>(await userInfo.json())

    // TODO Implement some logic to remove expired token from Token table
    // Save token, refresh token and expiration date to database
    const tokenExpirationDate = add(new Date(), { seconds: parseInt(oauthToken.data.expires_in) })
    await TokenRepository.saveTokenUserBind(profile.getUserId(), oauthToken.accessToken, oauthToken.refreshToken, tokenExpirationDate)

    // Send back access token to user
    return h.response({
        user: profile,
        accessToken: oauthToken.accessToken,
        expirationDate: tokenExpirationDate,
        expiresIn: oauthToken.data.expires_in
    })
}

export {
    oauthPluginName,
    oath2plugin
}
