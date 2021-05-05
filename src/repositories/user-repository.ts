import User from "../models/user"
import {PrismaClient} from "@prisma/client"
import PrismaProvider from "./core/prisma/prisma-provider"

export default class UserRepository {

    public static async getUsers(): Promise<User[]> {
        return (await PrismaProvider.getInstance().user.findMany()).map((user: object) => User.parseJSON<User>(user))
    }

    public static async getUser(id: number): Promise<User | null> {
        const user = await PrismaProvider.getInstance().user.findUnique({
            where: { id },
        })
        return user ? User.parseJSON<User>(user) : null
    }

    public static async createUser(user: User): Promise<User> {
        return User.parseJSON<User>(
            await PrismaProvider.getInstance().user.create({
                data: user,
            })
        )
    }

    public static async getUserByEmail(email: string): Promise<User | null> {
        const user = PrismaProvider.getInstance().user.findUnique({
            where: { email }
        })
        return user ? User.parseJSON(user) : null
    }

    public static async deleteUser(id: number): Promise<void> {
        await PrismaProvider.getInstance().user.delete({
            where: { id }
        })
    }

    public static async updateUser(id: number, user: User): Promise<User> {
        return User.parseJSON<User>(
            await PrismaProvider.getInstance().user.update({
                where: { id },
                data: user
            })
        )
    }

    public static async patchUser(id: number, user: Partial<User>): Promise<User> {
        return User.parseJSON<User>(
            await PrismaProvider.getInstance().user.update({
                where: { id },
                data: user
            })
        )
    }

}
