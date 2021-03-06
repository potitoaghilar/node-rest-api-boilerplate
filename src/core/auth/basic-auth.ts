import Hapi from "@hapi/hapi"
const Bcrypt = require('bcrypt')
const basicAuth = require('@hapi/basic')
const config = require('config')

// Default = admin:admin
const user = {
    username: config.get('swagger.auth.username'),
    password: config.get('swagger.auth.password'),
}

const basicAuthValidation = async (request: Hapi.Request, username: string, password: string) => {

    const isValid = await Bcrypt.compare(password, user.password)
    const credentials = { username: user.username }

    return { isValid, credentials }
}

export default async function registerBasicAuthStrategy(server: Hapi.Server) {

    // Registering basic auth plugin
    await server.register(basicAuth)

    // Create basic auth strategy
    server.auth.strategy('basicAuth', 'basic', {validate: basicAuthValidation})

}
