import ClientOAuth2 from "client-oauth2"
const config = require('config')

let instance: Oauth2Provider

export default class Oauth2Provider {

    private client: ClientOAuth2

    constructor() {
        this.client = new ClientOAuth2({
            clientId: process.env.OAUTH2_CLIENT_ID,
            clientSecret: process.env.OAUTH2_CLIENT_SECRET,
            // TODO Make these fields autoconfigurable: see https://qwee.eu.auth0.com/.well-known/openid-configuration
            accessTokenUri: config.get('oauth.tokenUri'),
            authorizationUri: config.get('oauth.authorizationUri'),
            redirectUri: config.get('oauth.redirectUri'),
            scopes: ['openid', 'offline_access', 'email', 'profile', 'nickname', 'identities'] // TODO configure other scopes
        })
    }

    static getInstance(): ClientOAuth2 {
        if (!instance) {
            instance = new Oauth2Provider()
        }
        return instance.client
    }

    static getUserInfoEndpoint(): string {
        return config.get('oauth.userInfoURI')
    }

}
