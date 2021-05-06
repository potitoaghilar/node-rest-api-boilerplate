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
import crypto from "crypto";

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

            const oauth2Provider = await Oauth2Provider.getProviderInstance()
            const introspectionEndpoint = oauth2Provider.getOpenidConfig().introspection_endpoint

            if (!introspectionEndpoint) {
                console.error('ERROR: OAuth2 introspection endpoint not set')
                return { isValid: false }
            }

            // Check if access token is in database
            const userTokenBind = TokenUserBind.fromJSON<TokenUserBind>(
                await PrismaProvider.getInstance().token.findUnique({
                    where: {
                        userId: Profile.getUserId(tokenData.user),
                        accessToken: tokenData.accessToken
                    }
                })
            )
            if (!userTokenBind) {
                return { isValid: false }
            }

            // Validate access token with authorization server
            const accessToken = tokenData.accessToken
            const validationResponse = await fetch(introspectionEndpoint, {
                method: 'POST',
                body: `token=${accessToken}`
            })

            // If access token is expired try to refresh it
            if (!validationResponse.ok) {

                // Get refresh token from database
                const refreshToken = userTokenBind.refreshToken

                const oauthToken = (await Oauth2Provider.getInstance()).createToken(accessToken, refreshToken, 'bearer', { })

                try {

                    // Try to refresh access code
                    const refreshedToken = await oauthToken.refresh()

                    // Update new token to database
                    await PrismaProvider.getInstance().token.update({
                        where: { refreshToken },
                        data: {
                            accessToken: refreshedToken.accessToken
                        }
                    })

                    // Generate JWT token
                    const jwtToken = jwt.sign({
                        user: tokenData.user,
                        accessToken: refreshedToken.accessToken
                    }, process.env.JWT_SECRET || crypto.randomBytes(20).toString('hex'))

                    // Notify client to change access token for next requests
                    return { isValid: true, credentials: { token: jwtToken } }

                } catch (ex) {

                    // Remove refresh token from database
                    await PrismaProvider.getInstance().token.delete({
                        where: { refreshToken }
                    })

                    // If refresh token is expired, force authenticate again
                    return { isValid: false }

                }

            }

            const isValid = (await validationResponse.json()).active
            return { isValid };
        },
    })

    // Send update JWT token in authorization header if needed
    server.ext('onPreResponse', ((request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        const {response} = request;
        if (!boom.isBoom(response) && typeof request.auth.credentials.token == 'string') {
            response.header('Authorization', request.auth.credentials.token)
        }
        return h.continue;
    }) as Method);

}
