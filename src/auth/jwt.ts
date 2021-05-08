import Hapi, {Lifecycle} from "@hapi/hapi"
import fetch from "node-fetch"
import Oauth2Provider from "../repositories/core/oauth2/oauth2-provider"
import PrismaProvider from "../repositories/core/prisma/prisma-provider"
import Profile from "../models/core/oauth2/profile"
import TokenUserBind from "../models/core/oauth2/token-user-bind"
import Method = Lifecycle.Method
const jwt2 = require('hapi-auth-jwt2')
import boom from '@hapi/boom'
import jwt from "jsonwebtoken";
import ClientOAuth2 from "client-oauth2";
import TokenRepository from "../repositories/core/oauth2/token-repository";

export default async function registerBearerTokenStrategy(server: Hapi.Server) {

    // Registering basic auth plugin
    await server.register(jwt2)

    // Create basic auth strategy
    server.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_SECRET,
        validate: async (tokenData: any, request: Hapi.Request, h: Hapi.ResponseToolkit) => {

            /**
             * Validate token with OAuth2 introspection endpoint
             */

            const oauth2Provider = await Oauth2Provider.getInstance()
            const oauth2Client = await Oauth2Provider.getClient()
            const introspectionEndpoint = oauth2Provider.getOpenidConfig().introspection_endpoint
            const userId = Profile.getUserId(tokenData.user)

            // Check if introspection endpoint is set
            if (!introspectionEndpoint) {
                console.error('ERROR: OAuth2 introspection endpoint not set')
                return { isValid: false }
            }

            // TODO on token update dies here
            // Check if access token is in database
            const userTokenBind = await TokenRepository.getTokenUserBind(userId, tokenData.accessToken)
            if (!userTokenBind) {
                return { isValid: false }
            }

            // Validate access token with authorization server
            const accessToken = tokenData.accessToken
            const validationResponse = await (await fetch(introspectionEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `token=${accessToken}`
            })).json()

            // If access token is expired try to refresh it
            if (!validationResponse.active) {

                // Generate token from rawData
                const oauthToken = oauth2Client.createToken(userTokenBind.rawData as ClientOAuth2.Data)

                try {

                    // Try to refresh access code
                    const refreshedOauthToken = await oauthToken.refresh()

                    // Update new tokens to database
                    await TokenRepository.updateTokenUserBind(userId, oauthToken, refreshedOauthToken)

                    // Exit if JWT secret is not set
                    if (!process.env.JWT_SECRET) {
                        console.error('ERROR: JWT secret not set')
                        return { isValid: false }
                    }

                    // Generate JWT token
                    const jwtToken = jwt.sign({
                        user: tokenData.user,
                        accessToken: refreshedOauthToken.accessToken
                    }, process.env.JWT_SECRET)

                    // TODO remove
                    console.log(jwtToken)

                    // Notify client to change access token for next requests
                    return { isValid: true, credentials: { token: jwtToken } }

                } catch (ex) {

                    // Remove refresh token from database
                    await TokenRepository.removeTokenUserBind(oauthToken)

                    // If refresh token is expired, force authenticate again
                    return { isValid: false }

                }

            }

            return { isValid: validationResponse.active };
        },
    })

    // Send update JWT token in authorization header if needed
    server.ext('onPreResponse', ((request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        const {response} = request;
        if (!boom.isBoom(response) && request.auth.credentials && typeof request.auth.credentials.token == 'string') {
            response.header('Authorization', request.auth.credentials.token)
        }
        return h.continue;
    }) as Method);

}
