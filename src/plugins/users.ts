import Hapi from '@hapi/hapi'
import handleValidationError from "../shared/validator/error"
import User from "../models/user"
import {idValidatorObject} from "../shared/validator/id-validator"
import UserRepository from "../repositories/user-repository"
import boom from '@hapi/boom'
import {healthPluginName} from "./core/health"
import {prismaPluginName} from "./core/prisma"

const usersPluginName = 'app/users'
const controllerName = 'UserController'

const usersController: Hapi.Plugin<undefined> = {
    name: usersPluginName,
    dependencies: [healthPluginName, prismaPluginName],
    register: (server: Hapi.Server) => {
        server.route([
            {
                method: 'GET',
                path: '/users',
                handler: getUsersHandler,
                options: {
                    description: 'Get all users',
                    notes: 'Get all users in the system.',
                    tags: ['api', controllerName],
                    auth: 'jwt'
                }
            },
            {
                method: 'GET',
                path: '/users/{id}',
                handler: getUserHandler,
                options: {
                    description: 'Get single user',
                    notes: 'Get a specific user in the system.',
                    tags: ['api', controllerName],
                    validate: {
                        params: idValidatorObject,
                        failAction: handleValidationError,
                    },
                    auth: 'jwt'
                },
            },
            {
                method: 'POST',
                path: '/users',
                handler: createHandler,
                options: {
                    description: 'Add new user',
                    notes: 'Get a new user in the system.',
                    tags: ['api', controllerName],
                    validate: {
                        payload: User.getValidator(),
                        failAction: handleValidationError
                    },
                    auth: 'jwt'
                },
            },
            {
                method: 'DELETE',
                path: '/users/{id}',
                handler: deleteHandler,
                options: {
                    description: 'Delete a user',
                    notes: 'Delete a user in the system.',
                    tags: ['api', controllerName],
                    validate: {
                        params: idValidatorObject,
                        failAction: handleValidationError,
                    },
                    auth: 'jwt'
                },
            },
            {
                method: 'PUT',
                path: '/users/{id}',
                handler: updateHandler,
                options: {
                    description: 'Update a user',
                    notes: 'Update an existing user in the system.',
                    tags: ['api', controllerName],
                    validate: {
                        params: idValidatorObject,
                        payload: User.getValidator(),
                        failAction: handleValidationError,
                    },
                    auth: 'jwt'
                },
            },
        ])
    },
}

async function getUsersHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const users = await UserRepository.getUsers()
    return h.response(users).code(200)
}

async function getUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userId = request.params.id

    const user = await UserRepository.getUser(userId)
    if (user) {
        return h.response(user).code(200)
    } else {
        return boom.notFound()
    }
}

async function createHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userRequest = User.fromJSON<User>(request.payload as object) as User

    // Check if email is unique
    const isNewEmail = !(await UserRepository.getUserByEmail(userRequest.email))

    if (!isNewEmail) {
        return boom.badRequest('Email already exists')
    }

    const userResponse = await UserRepository.createUser(userRequest)

    return h.response(userResponse).code(201)
}

async function deleteHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userId = request.params.id

    if (!(await UserRepository.getUser(userId))) {
        return boom.notFound()
    }

    await UserRepository.deleteUser(userId)
    return h.response().code(204)
}

async function updateHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userId = request.params.id

    const user = await User.fromJSON<User>(request.payload as object) as User

    if (!(await UserRepository.getUser(userId))) {
        return boom.notFound()
    }

    const updatedUser = await UserRepository.updateUser(userId, user)

    return h.response(updatedUser).code(200)
}

export {
    usersPluginName,
    usersController
}
