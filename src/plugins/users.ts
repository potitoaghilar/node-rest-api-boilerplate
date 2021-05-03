import Hapi from '@hapi/hapi'
import handleValidationError from "../shared/validator/error";
import User from "../models/user";
import {idValidatorObject} from "../shared/validator/id-validator";
import UserRepository from "../repositories/user-repository";
import boom from '@hapi/boom';

const controllerName = 'UserController';

const usersController: Hapi.Plugin<undefined> = {
    name: 'app/users',
    dependencies: ['healthCheck', 'prisma'],
    register: (server: Hapi.Server) => {
        server.route([
            {
                method: 'GET',
                path: '/users',
                handler: getUsersHandler,
                options: {
                    description: 'Get all users',
                    notes: 'Get all users in the system.',
                    tags: ['api', controllerName]
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
                    }
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
                },
            },
        ])
    },
}

async function getUsersHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const users = await UserRepository.getUsers(request.server.app.prisma)
    return h.response(users).code(200)
}

async function getUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userId = parseInt(request.params.id)

    const user = await UserRepository.getUser(request.server.app.prisma, userId)
    if (user) {
        return h.response(user).code(200)
    } else {
        return boom.notFound()
    }
}

async function createHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userRequest = User.parseJSON<User>(request.payload as object)

    // Check if email is unique
    const isNewEmail = !(await UserRepository.getUserByEmail(request.server.app.prisma, userRequest.email))

    if (!isNewEmail) {
        return boom.badRequest('Email already exists')
    }

    const userResponse = await UserRepository.createUser(request.server.app.prisma, userRequest)

    return h.response(userResponse).code(201)
}

async function deleteHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userId = parseInt(request.params.id)

    if (!(await UserRepository.getUser(request.server.app.prisma, userId))) {
        return boom.notFound()
    }

    await UserRepository.deleteUser(request.server.app.prisma, userId)
    return h.response().code(204)
}

async function updateHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    const userId = parseInt(request.params.id)

    const user = await User.parseJSON<User>(request.payload as object)

    if (!(await UserRepository.getUser(request.server.app.prisma, userId))) {
        return boom.notFound()
    }

    const updatedUser = await UserRepository.updateUser(request.server.app.prisma, userId, user)

    return h.response(updatedUser).code(200)
}

export default usersController
