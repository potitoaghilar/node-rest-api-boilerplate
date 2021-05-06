
export default interface IOpenidConfig {
    authorization_endpoint: string
    token_endpoint: string
    userinfo_endpoint: string
    scopes_supported: string[]
    introspection_endpoint: string
    revocation_endpoint: string
}
