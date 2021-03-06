import ClientOAuth2 from "client-oauth2"
import fetch from "node-fetch";
import IOpenidConfig from "../models/oauth2/interfaces/iopenid-config";
const config = require('config')

let instance: Oauth2Provider

export default class Oauth2Provider {

    private client!: ClientOAuth2
    private openidConfig!: IOpenidConfig
    private neededScopes = ['openid', 'offline_access']

    constructor() {

    }

    private async init() {

        // Fetch OAuth2 config on first creation
        await Oauth2Provider.fetchConfig()

        // Create OAuth2 client
        this.client = new ClientOAuth2({
            clientId: process.env.OAUTH2_CLIENT_ID,
            clientSecret: process.env.OAUTH2_CLIENT_SECRET,
            accessTokenUri: this.openidConfig.token_endpoint,
            authorizationUri: this.openidConfig.authorization_endpoint,
            redirectUri: config.get('oauth.redirectUri'),
            scopes: this.neededScopes.filter(scope => this.openidConfig.scopes_supported.includes(scope))
        })

    }

    static async getInstance(): Promise<Oauth2Provider> {
        if (!instance) {
            instance = new Oauth2Provider()
            await instance.init()
        }
        return instance
    }

    static async getClient(): Promise<ClientOAuth2> {
        return (await this.getInstance()).client
    }

    getOpenidConfig(): IOpenidConfig {
        return this.openidConfig
    }

    private static async fetchConfig() {
        const openidConfig = await fetch(config.get('oauth.openidConfigURI'), {method: 'GET'})
        instance.openidConfig = await openidConfig.json()
        instance.openidConfig.introspection_endpoint = config.get('oauth.introspectionURI')
    }

    static getUserInfoEndpoint(): string {
        return instance.openidConfig.userinfo_endpoint
    }

}
