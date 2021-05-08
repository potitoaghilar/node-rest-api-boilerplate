import User from "../models/user"
import PrismaProvider from "./core/prisma/prisma-provider"

export default class UserRepository {

    public static async getUsers(): Promise<User[]> {
        return (await PrismaProvider.getClient().user.findMany()).map((user: object) => User.fromJSON<User>(user))
    }

    public static async getUser(id: string): Promise<User | null> {
        const user = await PrismaProvider.getClient().user.findUnique({
            where: { id },
        })
        return user ? User.fromJSON<User>(user) : null
    }

    public static async createUser(user: User): Promise<User> {
        return User.fromJSON<User>(
            await PrismaProvider.getClient().user.create({
                data: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    social: user.social?.asJSON(),
                },
            })
        ) as User
    }

    public static async getUserByEmail(email: string): Promise<User | null> {
        const user = PrismaProvider.getClient().user.findUnique({
            where: { email }
        })
        return user ? User.fromJSON(user) : null
    }

    public static async deleteUser(id: string): Promise<void> {
        await PrismaProvider.getClient().user.delete({
            where: { id }
        })
    }

    public static async updateUser(id: string, user: User): Promise<User> {
        return User.fromJSON<User>(
            await PrismaProvider.getClient().user.update({
                where: { id },
                data: user
            })
        ) as User
    }

    public static async patchUser(id: string, user: Partial<User>): Promise<User> {
        return User.fromJSON<User>(
            await PrismaProvider.getClient().user.update({
                where: { id },
                data: user
            })
        ) as User
    }

}
