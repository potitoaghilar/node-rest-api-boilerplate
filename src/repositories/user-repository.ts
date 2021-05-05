import User from "../models/user"
import PrismaProvider from "./core/prisma/prisma-provider"

export default class UserRepository {

    public static async getUsers(): Promise<User[]> {
        return (await PrismaProvider.getInstance().user.findMany()).map((user: object) => User.fromJSON<User>(user))
    }

    public static async getUser(id: string): Promise<User | null> {
        const user = await PrismaProvider.getInstance().user.findUnique({
            where: { id },
        })
        return user ? User.fromJSON<User>(user) : null
    }

    public static async createUser(user: User): Promise<User> {
        return User.fromJSON<User>(
            await PrismaProvider.getInstance().user.create({
                data: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    social: user.social?.asJSON(),
                },
            })
        )
    }

    public static async getUserByEmail(email: string): Promise<User | null> {
        const user = PrismaProvider.getInstance().user.findUnique({
            where: { email }
        })
        return user ? User.fromJSON(user) : null
    }

    public static async deleteUser(id: string): Promise<void> {
        await PrismaProvider.getInstance().user.delete({
            where: { id }
        })
    }

    public static async updateUser(id: string, user: User): Promise<User> {
        return User.fromJSON<User>(
            await PrismaProvider.getInstance().user.update({
                where: { id },
                data: user
            })
        )
    }

    public static async patchUser(id: string, user: Partial<User>): Promise<User> {
        return User.fromJSON<User>(
            await PrismaProvider.getInstance().user.update({
                where: { id },
                data: user
            })
        )
    }

}
