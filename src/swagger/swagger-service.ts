const config = require('config')
const Pack = require('../../package')
const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger')

const swaggerOptions = {
    info: {
        title: config.get('swagger.title'),
        description: config.get('swagger.description'),
        version: Pack.version,
        contact: {
            name: config.get('swagger.contact.name'),
            url: config.get('swagger.contact.url'),
            email: config.get('swagger.contact.email')
        },
    },
    auth: 'basicAuth',
    documentationPath: '/api-docs',
    schemes: ['https', 'http'],
    securityDefinitions: {
        'jwt': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    security: [{ 'jwt': [] }],
    grouping: 'tags',
    tags: [
        {
            name: 'UserController',
            description: 'Users CRUD operations'
        }
    ],
    sortEndpoints: 'method'
}

const swaggerPlugins = [
    Inert,
    Vision,
    {
        plugin: HapiSwagger,
        options: swaggerOptions
    }
]

export { swaggerPlugins }
